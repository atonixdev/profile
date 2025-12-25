from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('contenttypes', '0002_remove_content_type_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='ActivityEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('login', 'Login'), ('view', 'View'), ('api_call', 'API Call'), ('create', 'Create'), ('update', 'Update'), ('delete', 'Delete'), ('error', 'Error')], max_length=20)),
                ('object_id', models.CharField(blank=True, max_length=64, null=True)),
                ('path', models.CharField(max_length=512)),
                ('method', models.CharField(max_length=10)),
                ('status_code', models.IntegerField(blank=True, null=True)),
                ('duration_ms', models.IntegerField(blank=True, null=True)),
                ('ip_address', models.CharField(blank=True, max_length=64, null=True)),
                ('user_agent', models.CharField(blank=True, max_length=512, null=True)),
                ('referrer', models.CharField(blank=True, max_length=512, null=True)),
                ('extra', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('actor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='activity_events', to=settings.AUTH_USER_MODEL)),
                ('object_type', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='contenttypes.contenttype')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='activityevent',
            index=models.Index(fields=['created_at'], name='activity_ev_created_0cfa1b_idx'),
        ),
        migrations.AddIndex(
            model_name='activityevent',
            index=models.Index(fields=['action', 'created_at'], name='activity_ev_action_c8b6a6_idx'),
        ),
        migrations.AddIndex(
            model_name='activityevent',
            index=models.Index(fields=['path'], name='activity_ev_path_5e6db8_idx'),
        ),
    ]
