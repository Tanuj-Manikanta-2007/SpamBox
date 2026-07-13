from django.shortcuts import render
from django.template import TemplateDoesNotExist


def _render_first_available(request, *template_names):
    for template_name in template_names:
        try:
            return render(request, template_name)
        except TemplateDoesNotExist:
            continue
    raise TemplateDoesNotExist(template_names)


def index(request):
    return _render_first_available(request, "index.html", "index/index.html")


def privacy(request):
    return render(request, "privacy.html")


def terms(request):
    return render(request, "terms.html")
