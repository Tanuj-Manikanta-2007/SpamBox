import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.shortcuts import render

from .forms import SpamCheckForm
from .models import SpamCheck


def spam_check(request):
	api_url = getattr(settings, 'SPAM_API_URL', 'https://spam-mail-api-l6cq.onrender.com/predict')

	result = None
	error_message = None

	if request.method == 'POST':
		form = SpamCheckForm(request.POST)
		if form.is_valid():
			text = form.cleaned_data['text']
			payload = json.dumps({'text': text, 'message': text}).encode('utf-8')
			req = Request(
				api_url,
				data=payload,
				headers={'Content-Type': 'application/json'},
				method='POST',
			)

			try:
				with urlopen(req, timeout=15) as resp:
					body = resp.read().decode('utf-8')
				result = json.loads(body)

				SpamCheck.objects.create(
					text=text,
					prediction=str(result.get('prediction', '')),
					confidence=_to_float(result.get('confidence')),
					spam_probability=_to_float(result.get('spam_probability')),
					ham_probability=_to_float(result.get('ham_probability')),
				)
			except HTTPError as e:
				try:
					body = e.read().decode('utf-8')
				except Exception:
					body = ''
				error_message = f"API error ({e.code}). {body}".strip()
			except URLError as e:
				error_message = f"Could not reach API: {e.reason}"
			except json.JSONDecodeError:
				error_message = "API returned invalid JSON."
			except Exception as e:
				error_message = f"Unexpected error: {e}"
	else:
		form = SpamCheckForm()

	return render(
		request,
		'spam_ui/spam_check.html',
		{
			'form': form,
			'api_url': api_url,
			'result': result,
			'error_message': error_message,
		},
	)


def _to_float(value):
	if value is None:
		return None
	try:
		return float(value)
	except (TypeError, ValueError):
		return None

# Create your views here.
