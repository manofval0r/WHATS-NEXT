from django.core.management.base import BaseCommand
from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site
from django.conf import settings
import os

class Command(BaseCommand):
    help = 'Sets up SocialApp records for OAuth providers from environment variables'

    def handle(self, *args, **kwargs):
        self.stdout.write("Setting up SocialApps...")
        
        # Ensure Site exists
        site, created = Site.objects.get_or_create(id=settings.SITE_ID, defaults={
            'domain': 'whats-next-1.onrender.com',
            'name': 'WhatsNext'
        })
        if created:
            self.stdout.write(f"Created Site: {site.domain}")
        else:
            # Update domain if needed (optional, but good for ensuring consistency)
            site.domain = 'whats-next-1.onrender.com'
            site.name = 'WhatsNext'
            site.save()
            self.stdout.write(f"Updated Site: {site.domain}")

        # GitHub
        github_client_id = os.getenv('GITHUB_CLIENT_ID')
        github_secret = os.getenv('GITHUB_SECRET')
        if github_client_id and github_secret:
            app, created = SocialApp.objects.update_or_create(
                provider='github',
                defaults={
                    'name': 'GitHub',
                    'client_id': github_client_id,
                    'secret': github_secret,
                }
            )
            app.sites.add(site)
            self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Updated'} GitHub App"))
        else:
            self.stdout.write(self.style.WARNING("GITHUB_CLIENT_ID or GITHUB_SECRET not found in env"))

        # Google
        google_client_id = os.getenv('GOOGLE_CLIENT_ID')
        google_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        if google_client_id and google_secret:
            app, created = SocialApp.objects.update_or_create(
                provider='google',
                defaults={
                    'name': 'Google',
                    'client_id': google_client_id,
                    'secret': google_secret,
                }
            )
            app.sites.add(site)
            self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Updated'} Google App"))
        else:
            self.stdout.write(self.style.WARNING("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not found in env"))
