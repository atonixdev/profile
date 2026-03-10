from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_add_verification_code'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='oauth_provider',
            field=models.CharField(blank=True, db_index=True, default='', max_length=20),
        ),
        migrations.AddField(
            model_name='profile',
            name='oauth_provider_id',
            field=models.CharField(blank=True, db_index=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='profile',
            name='oauth_email',
            field=models.EmailField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='profile',
            name='oauth_avatar',
            field=models.URLField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='profile',
            name='oauth_verified',
            field=models.BooleanField(default=False),
        ),
    ]
