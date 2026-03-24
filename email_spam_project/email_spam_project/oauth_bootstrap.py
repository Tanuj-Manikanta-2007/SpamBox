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

        apps = list(SocialApp.objects.filter(provider="google").order_by("id"))
        if not apps:
            app = SocialApp.objects.create(
                provider="google",
                name="Google",
                client_id=client_id,
                secret=client_secret,
                key="",
            )
            apps = [app]

        primary = apps[0]

        changed = False
        if primary.client_id != client_id:
            primary.client_id = client_id
            changed = True
        if primary.secret != client_secret:
            primary.secret = client_secret
            changed = True
        if primary.key != "":
            primary.key = ""
            changed = True
        if primary.name != "Google":
            primary.name = "Google"
            changed = True
        if primary.provider != "google":
            primary.provider = "google"
            changed = True
        if changed:
            primary.save()

        # Ensure the site is linked to exactly one google app to avoid
        # allauth.adapter.get_app() raising MultipleObjectsReturned.
        primary.sites.add(site)
        for extra in apps[1:]:
            extra.sites.remove(site)

        return True
    except (OperationalError, ProgrammingError):
        # Database not ready (migrations not applied yet) — don't crash the server.
        return False
