from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def dataset_upload_path(instance, filename: str) -> str:
    return f"ai_lab/datasets/{instance.created_by_id or 'anonymous'}/{filename}"


def model_upload_path(instance, filename: str) -> str:
    safe_version = instance.version or 'v0'
    return f"ai_lab/models/{instance.created_by_id or 'anonymous'}/{instance.name}/{safe_version}/{filename}"


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Dataset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('file', models.FileField(upload_to=dataset_upload_path)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ai_datasets', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ModelArtifact',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('version', models.CharField(blank=True, max_length=50)),
                ('description', models.TextField(blank=True)),
                ('file', models.FileField(upload_to=model_upload_path)),
                ('metrics', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ai_model_artifacts', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
