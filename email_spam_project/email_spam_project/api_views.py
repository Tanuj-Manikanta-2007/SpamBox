import json
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen

from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST


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


def _error(message: str, status: int = 400):
    return JsonResponse({"error": message}, status=status)


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
def ai_response(request):
    payload = _read_json_body(request)
    text = (payload.get("text") or payload.get("message") or "").strip()
    if not text:
        return _error("Missing 'text'", status=400)

    base_url = _base_url_from_settings()
    endpoint_url = getattr(settings, "AI_RESPONSE_API_URL", urljoin(base_url, "ai-response"))

    try:
        result = _post_json(endpoint_url, {"text": text, "message": text})
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
