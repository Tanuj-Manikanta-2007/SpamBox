import os


def _getenv_first(*names: str) -> str | None:
    for name in names:
        value = os.environ.get(name)
        if value:
            return value
    return None


def bootstrap_google_socialapp() -> bool:
    """Ensure a Google SocialApp exists and is linked to Site(id=1).

    This is a small runtime guard for deployments (e.g., Render) where the
    database may not have a SocialApp row configured via the admin UI.
    """

    client_id = _getenv_first(
        "GOOGLE_CLIENT_ID",
        "GOOGLE_OAUTH_CLIENT_ID",
        "DJANGO_GOOGLE_CLIENT_ID",
    )
    client_secret = _getenv_first(
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_OAUTH_CLIENT_SECRET",
        "DJANGO_GOOGLE_CLIENT_SECRET",
    )

    if not (client_id and client_secret):
        return False

    try:
        from django.contrib.sites.models import Site
        from django.db.utils import OperationalError, ProgrammingError

        from allauth.socialaccount.models import SocialApp
    except Exception:
        return False

    try:
        render_hostname = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
        default_domain = render_hostname or "localhost"

        site, _ = Site.objects.get_or_create(
            id=1,
            defaults={
                "domain": default_domain,
                "name": default_domain,
            },
        )

        if render_hostname and site.domain != render_hostname:
            site.domain = render_hostname
            site.name = render_hostname
            site.save(update_fields=["domain", "name"])

        try:
            app, created = SocialApp.objects.get_or_create(
                provider="google",
                name="Google",
                defaults={
                    "client_id": client_id,
                    "secret": client_secret,
                    "key": "",
                },
            )
        except SocialApp.MultipleObjectsReturned:
            app = SocialApp.objects.filter(provider="google").order_by("id").first()
            created = False

        if not app:
            return False

        changed = False
        if app.client_id != client_id:
            app.client_id = client_id
            changed = True
        if app.secret != client_secret:
            app.secret = client_secret
            changed = True
        if app.key != "":
            app.key = ""
            changed = True
        if app.name != "Google":
            app.name = "Google"
            changed = True
        if app.provider != "google":
            app.provider = "google"
            changed = True

        if changed and not created:
            app.save()

        app.sites.add(site)
        return True
    except (OperationalError, ProgrammingError):
        # Database not ready (migrations not applied yet) — don't crash the server.
        return False
