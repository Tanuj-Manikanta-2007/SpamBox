import json
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen

from django.conf import settings
from django.shortcuts import render

from .forms import AiTextForm


def _base_url_from_settings() -> str:
    spam_api_url = getattr(settings, "SPAM_API_URL", "https://spam-mail-api-l6cq.onrender.com/predict")
    base_url = spam_api_url.rsplit("/", 1)[0].rstrip("/") + "/"
    return getattr(settings, "AI_API_BASE_URL", base_url)


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


def _normalize_text(value):
    if value is None:
        return None
    if not isinstance(value, str):
        return value
    # If the API returns literal backslash-n sequences, render them as real newlines.
    return value.replace("\\n", "\n")


def home(request):
    return render(request, "ai_ui/home.html")


def summary(request):
    base_url = _base_url_from_settings()
    endpoint_url = getattr(settings, "SUMMARY_API_URL", urljoin(base_url, "summary"))

    result = None
    error_message = None

    if request.method == "POST":
        form = AiTextForm(request.POST)
        if form.is_valid():
            text = form.cleaned_data["text"]
            try:
                result = _post_json(endpoint_url, {"text": text, "message": text})
            except HTTPError as e:
                try:
                    body = e.read().decode("utf-8")
                except Exception:
                    body = ""
                error_message = f"API error ({e.code}). {body}".strip()
            except URLError as e:
                error_message = f"Could not reach API: {e.reason}"
            except json.JSONDecodeError:
                error_message = "API returned invalid JSON."
            except Exception as e:
                error_message = f"Unexpected error: {e}"
    else:
        form = AiTextForm()

    return render(
        request,
        "ai_ui/summary.html",
        {
            "form": form,
            "api_url": endpoint_url,
            "result": result,
            "summary_text": (
                _normalize_text((result or {}).get("summary"))
                or _normalize_text((result or {}).get("text"))
                or _normalize_text((result or {}).get("ai_summary"))
            )
            if isinstance(result, dict)
            else None,
            "error_message": error_message,
        },
    )


def ai_response(request):
    base_url = _base_url_from_settings()
    endpoint_url = getattr(settings, "AI_RESPONSE_API_URL", urljoin(base_url, "ai-response"))

    result = None
    error_message = None

    if request.method == "POST":
        form = AiTextForm(request.POST)
        if form.is_valid():
            text = form.cleaned_data["text"]
            try:
                result = _post_json(endpoint_url, {"text": text, "message": text})
            except HTTPError as e:
                try:
                    body = e.read().decode("utf-8")
                except Exception:
                    body = ""
                error_message = f"API error ({e.code}). {body}".strip()
            except URLError as e:
                error_message = f"Could not reach API: {e.reason}"
            except json.JSONDecodeError:
                error_message = "API returned invalid JSON."
            except Exception as e:
                error_message = f"Unexpected error: {e}"
    else:
        form = AiTextForm()

    ai_text = None
    if isinstance(result, dict):
        ai_text = (
            result.get("ai_response")
            or result.get("reply")
            or result.get("response")
            or result.get("text")
        )
        ai_text = _normalize_text(ai_text)

    return render(
        request,
        "ai_ui/ai_response.html",
        {
            "form": form,
            "api_url": endpoint_url,
            "result": result,
            "ai_text": ai_text,
            "error_message": error_message,
        },
    )
