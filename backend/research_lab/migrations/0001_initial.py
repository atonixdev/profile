from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Experiment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.SlugField(unique=True)),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                (
                    'experiment_type',
                    models.CharField(
                        choices=[
                            ('simulation', 'Simulation'),
                            ('data_processing', 'Data Processing'),
                            ('model_training', 'Model Training'),
                        ],
                        max_length=32,
                    ),
                ),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='ExperimentRun',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                (
                    'status',
                    models.CharField(
                        choices=[
                            ('pending', 'Pending'),
                            ('running', 'Running'),
                            ('succeeded', 'Succeeded'),
                            ('failed', 'Failed'),
                        ],
                        default='pending',
                        max_length=16,
                    ),
                ),
                ('params', models.JSONField(blank=True, default=dict)),
                ('output', models.JSONField(blank=True, default=dict)),
                ('metrics', models.JSONField(blank=True, default=dict)),
                ('error_text', models.TextField(blank=True)),
                ('duration_ms', models.PositiveIntegerField(blank=True, null=True)),
                ('local_sqlite_path', models.CharField(blank=True, max_length=512)),
                ('started_at', models.DateTimeField(blank=True, null=True)),
                ('finished_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                (
                    'experiment',
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='runs', to='research_lab.experiment'),
                ),
                (
                    'user',
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name='experiment_runs',
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
