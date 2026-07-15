from __future__ import annotations

import os
import sys
from pathlib import Path

# Render may run from the repo root, but the Django project lives in
# email_automater/email_spam_project. Add it to sys.path so imports like
# `email_spam_project.settings` resolve correctly.
REPO_ROOT = Path(__file__).resolve().parents[1]
DJANGO_PROJECT_DIR = REPO_ROOT / "SpamBox" / "email_spam_project"

if DJANGO_PROJECT_DIR.exists():
    sys.path.insert(0, str(DJANGO_PROJECT_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "email_spam_project.settings")

from django.core.asgi import get_asgi_application  # noqa: E402

app = get_asgi_application()
