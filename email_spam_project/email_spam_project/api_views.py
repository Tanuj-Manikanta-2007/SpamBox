import json
import os
import re
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen

from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from allauth.socialaccount.models import SocialAccount, SocialToken
from django.contrib.auth import logout as django_logout


def _base_url_from_settings() -> str:
    spam_api_url = getattr(settings, "SPAM_API_URL", "https://spam-mail-api-l6cq.onrender.com/predict")
    base_url = spam_api_url.rsplit("/", 1)[0].rstrip("/") + "/"
    return getattr(settings, "AI_API_BASE_URL", base_url)


def _read_json_body(request) -> dict:
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode("utf-8"))
    except Exception:
        return {}


def _post_json(url: str, payload: dict) -> dict:
    data = json.dumps(payload).encode("utf-8")
    req = Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(req, timeout=20) as resp:
        body = resp.read().decode("utf-8")
    return json.loads(body)


def _looks_like_upstream_error_text(text: str | None) -> bool:
    if not text:
        return False
    t = text.strip().lower()
    return t.startswith("error:") or t.startswith("failed")


def _gemini_api_key() -> str | None:
    # Keep it env-based so it works on Render and locally.
    return os.environ.get("GEMINI_API_KEY")


def _gemini_model() -> str:
    return os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")


def _clean_one_line(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip())


def _maybe_generate_with_gemini(prompt: str) -> str | None:
    api_key = _gemini_api_key()
    if not api_key:
        return None
    try:
        from google import genai
    except Exception:
        return None

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(model=_gemini_model(), contents=prompt)
    text = getattr(response, "text", "") or ""
    return _clean_one_line(text)


def _error(message: str, status: int = 400):
    return JsonResponse({"error": message}, status=status)


def _get_google_token_for_user(user):
    if not user.is_authenticated:
        return None
    return (
        SocialToken.objects.filter(account__user=user, account__provider="google")
        .select_related("app", "account")
        .order_by("-id")
        .first()
    )


@csrf_exempt
@require_POST
def logout(request):
    # For a static-exported frontend, CSRF tokens are inconvenient.
    # Logging out via CSRF is low-risk; this endpoint intentionally keeps it simple.
    django_logout(request)
    return JsonResponse({"ok": True}, status=200)


@require_GET
def me(request):
    google_oauth_configured = bool(
        getattr(settings, "GOOGLE_CLIENT_ID", None) and getattr(settings, "GOOGLE_CLIENT_SECRET", None)
    )

    if not request.user.is_authenticated:
        return JsonResponse(
            {
                "authenticated": False,
                "google_oauth_configured": google_oauth_configured,
            },
            status=200,
        )

    email = None
    account = SocialAccount.objects.filter(user=request.user, provider="google").order_by("-id").first()
    if account:
        email = account.extra_data.get("email")

    return JsonResponse(
        {
            "authenticated": True,
            "google_oauth_configured": google_oauth_configured,
            "username": request.user.get_username(),
            "email": email or getattr(request.user, "email", None),
        },
        status=200,
    )


@require_GET
def gmail_inbox(request):
    if not request.user.is_authenticated:
        return _error("Not authenticated", status=401)

    token = _get_google_token_for_user(request.user)
    if not token:
        return _error("Google account not connected", status=400)

    try:
        from google.auth.transport.requests import Request as GoogleRequest
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
    except Exception as e:
        return _error(f"Google API libraries not installed: {e}", status=500)

    client_id = getattr(settings, "GOOGLE_CLIENT_ID", None)
    client_secret = getattr(settings, "GOOGLE_CLIENT_SECRET", None)
    if not (client_id and client_secret) and getattr(token, "app", None):
        client_id = token.app.client_id
        client_secret = token.app.secret

    if not (client_id and client_secret):
        return _error("Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET", status=500)

    scopes = settings.SOCIALACCOUNT_PROVIDERS.get("google", {}).get("SCOPE", [])

    creds = Credentials(
        token=token.token,
        refresh_token=token.token_secret or None,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=scopes,
    )

    # Refresh if needed
    try:
        if not creds.valid and creds.refresh_token:
            creds.refresh(GoogleRequest())
    except Exception as e:
        return _error(f"Could not refresh Google token: {e}", status=401)

    try:
        service = build("gmail", "v1", credentials=creds, cache_discovery=False)

        try:
            limit = int(request.GET.get("limit", "15"))
        except ValueError:
            limit = 15
        limit = max(1, min(limit, 25))

        listing = service.users().messages().list(userId="me", maxResults=limit, q="in:inbox").execute()
        message_ids = [m.get("id") for m in listing.get("messages", []) if m.get("id")]

        emails = []
        for msg_id in message_ids:
            msg = (
                service.users()
                .messages()
                .get(
                    userId="me",
                    id=msg_id,
                    format="metadata",
                    metadataHeaders=["From", "Subject", "Date"],
                )
                .execute()
            )

            headers = {h.get("name"): h.get("value") for h in msg.get("payload", {}).get("headers", [])}
            emails.append(
                {
                    "id": msg_id,
                    "sender": headers.get("From", ""),
                    "subject": headers.get("Subject", ""),
                    "time": headers.get("Date", ""),
                    "preview": msg.get("snippet", ""),
                }
            )

        return JsonResponse({"emails": emails}, status=200)
    except Exception as e:
        return _error(f"Gmail API error: {e}", status=502)


@csrf_exempt
@require_POST
def predict(request):
    payload = _read_json_body(request)
    text = (payload.get("text") or payload.get("message") or "").strip()
    if not text:
        return _error("Missing 'text'", status=400)

    api_url = getattr(settings, "SPAM_API_URL", "https://spam-mail-api-l6cq.onrender.com/predict")
    try:
        result = _post_json(api_url, {"text": text, "message": text})
        return JsonResponse(result, status=200)
    except HTTPError as e:
        try:
            body = e.read().decode("utf-8")
        except Exception:
            body = ""
        return _error(f"Upstream API error ({e.code}). {body}".strip(), status=502)
    except URLError as e:
        return _error(f"Could not reach upstream API: {e.reason}", status=502)
    except json.JSONDecodeError:
        return _error("Upstream API returned invalid JSON.", status=502)
    except Exception as e:
        return _error(f"Unexpected error: {e}", status=502)


@csrf_exempt
@require_POST
def summary(request):
    payload = _read_json_body(request)
    text = (payload.get("text") or payload.get("message") or "").strip()
    if not text:
        return _error("Missing 'text'", status=400)

    base_url = _base_url_from_settings()
    endpoint_url = getattr(settings, "SUMMARY_API_URL", urljoin(base_url, "summary"))

    try:
        result = _post_json(endpoint_url, {"text": text, "message": text})
        if result.get("error"):
            raise RuntimeError(str(result.get("error")))
        if _looks_like_upstream_error_text(result.get("text")):
            raise RuntimeError(str(result.get("text")))
        return JsonResponse(result, status=200)
    except HTTPError as e:
        try:
            body = e.read().decode("utf-8")
        except Exception:
            body = ""
        upstream_error = f"Upstream API error ({e.code}). {body}".strip()
    except URLError as e:
        upstream_error = f"Could not reach upstream API: {e.reason}"
    except json.JSONDecodeError:
        upstream_error = "Upstream API returned invalid JSON."
    except Exception as e:
        upstream_error = f"Unexpected error: {e}"

    # Fallback: if upstream fails, optionally use Gemini locally.
    gemini_text = _maybe_generate_with_gemini(
        "Summarize the following text in 50 words or fewer. Return only the summary text.\n\n"
        f"TEXT:\n{text}"
    )
    if gemini_text:
        return JsonResponse({"text": gemini_text, "summary": gemini_text, "fallback": "gemini"}, status=200)

    return _error(upstream_error, status=502)


@csrf_exempt
@require_POST
def ai_response(request):
    payload = _read_json_body(request)
    text = (payload.get("text") or payload.get("message") or "").strip()
    if not text:
        return _error("Missing 'text'", status=400)

    base_url = _base_url_from_settings()
    endpoint_url = getattr(settings, "AI_RESPONSE_API_URL", urljoin(base_url, "ai-response"))

    try:
        result = _post_json(endpoint_url, {"text": text, "message": text})
        if result.get("error"):
            raise RuntimeError(str(result.get("error")))
        if _looks_like_upstream_error_text(result.get("text")):
            raise RuntimeError(str(result.get("text")))
        return JsonResponse(result, status=200)
    except HTTPError as e:
        try:
            body = e.read().decode("utf-8")
        except Exception:
            body = ""
        upstream_error = f"Upstream API error ({e.code}). {body}".strip()
    except URLError as e:
        upstream_error = f"Could not reach upstream API: {e.reason}"
    except json.JSONDecodeError:
        upstream_error = "Upstream API returned invalid JSON."
    except Exception as e:
        upstream_error = f"Unexpected error: {e}"

    # Fallback: if upstream fails, optionally use Gemini locally.
    gemini_text = _maybe_generate_with_gemini(
        "Write a helpful reply to the following message. Return only the reply text.\n\n"
        f"MESSAGE:\n{text}"
    )
    if gemini_text:
        return JsonResponse(
            {
                "text": gemini_text,
                "ai_response": gemini_text,
                "reply": gemini_text,
                "fallback": "gemini",
            },
            status=200,
        )

    return _error(upstream_error, status=502)
