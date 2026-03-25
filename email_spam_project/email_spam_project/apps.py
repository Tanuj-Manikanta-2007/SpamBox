from __future__ import annotations

import threading

from django.apps import AppConfig
from django.core.signals import request_started


class EmailSpamProjectConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "email_spam_project"

    def ready(self):
        lock = threading.Lock()
        state = {"ran": False}

        def _bootstrap_once(**_kwargs):
            with lock:
                if state["ran"]:
                    return
                state["ran"] = True
            try:
                from .oauth_bootstrap import bootstrap_google_socialapp

                bootstrap_google_socialapp()
            except Exception:
                pass

        request_started.connect(_bootstrap_once, dispatch_uid="email_spam_project.oauth_bootstrap")
