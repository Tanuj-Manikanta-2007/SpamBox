"""
URL configuration for email_spam_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path, re_path

from . import api_views, frontend_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    # API endpoints (support both with and without trailing slashes)
    path("api/me", api_views.me),
    path("api/me/", api_views.me),
    path("api/logout", api_views.logout),
    path("api/logout/", api_views.logout),
    path("api/gmail/inbox", api_views.gmail_inbox),
    path("api/gmail/inbox/", api_views.gmail_inbox),
    path("api/predict", api_views.predict),
    path("api/predict/", api_views.predict),
    path("api/summary", api_views.summary),
    path("api/summary/", api_views.summary),
    path("api/ai-response", api_views.ai_response),
    path("api/ai-response/", api_views.ai_response),

    # Legacy server-rendered Django pages (kept for reference)
    path("legacy/spam/", include("spam_ui.urls")),
    path("legacy/", include("ai_ui.urls")),

    # Frontend (static-exported Next.js) - catch-all
    re_path(r"^(?!static/|api/|admin/|accounts/|legacy/).*$", frontend_views.index),
]
