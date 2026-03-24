from django.urls import path

from . import views

app_name = "spam_ui"

urlpatterns = [
    path("", views.spam_check, name="spam_check"),
]
