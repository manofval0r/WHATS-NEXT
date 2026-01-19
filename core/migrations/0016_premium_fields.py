from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0015_userroadmapitem_github_score_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='plan_tier',
            field=models.CharField(choices=[('FREE', 'Free'), ('PREMIUM', 'Premium')], default='FREE', max_length=10),
        ),
        migrations.AddField(
            model_name='user',
            name='premium_waitlist_status',
            field=models.CharField(choices=[('none', 'None'), ('pending', 'Pending'), ('approved', 'Approved')], default='none', max_length=20),
        ),
        migrations.AddField(
            model_name='user',
            name='premium_waitlist_joined_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='premium_waitlist_source',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='user',
            name='premium_waitlist_feature',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='user',
            name='cv_exports_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='user',
            name='cv_exports_reset_at',
            field=models.DateField(blank=True, null=True),
        ),
    ]
