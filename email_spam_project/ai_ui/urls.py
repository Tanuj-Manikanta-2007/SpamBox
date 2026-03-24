from django.urls import path

from . import views

app_name = "ai_ui"

urlpatterns = [
    path("", views.home, name="home"),
    path("summary/", views.summary, name="summary"),
    path("ai-response/", views.ai_response, name="ai_response"),
]
