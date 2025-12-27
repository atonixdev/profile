from django.db import migrations


def seed_default_experiments(apps, schema_editor):
    Experiment = apps.get_model('research_lab', 'Experiment')

    defaults = [
        {
            'slug': 'gbm-simulation',
            'name': 'GBM Simulation',
            'description': 'Monte Carlo simulation (geometric Brownian motion) using stdlib only.',
            'experiment_type': 'simulation',
            'is_active': True,
        },
        {
            'slug': 'basic-data-processing',
            'name': 'Basic Data Processing',
            'description': 'Parse numeric values from list/CSV and compute summary stats.',
            'experiment_type': 'data_processing',
            'is_active': True,
        },
        {
            'slug': 'linear-regression-training',
            'name': 'Linear Regression Training',
            'description': 'Fits y=a+b*x with closed-form least squares (stdlib only).',
            'experiment_type': 'model_training',
            'is_active': True,
        },
    ]

    for d in defaults:
        Experiment.objects.update_or_create(slug=d['slug'], defaults=d)


def unseed_default_experiments(apps, schema_editor):
    Experiment = apps.get_model('research_lab', 'Experiment')
    Experiment.objects.filter(
        slug__in=[
            'gbm-simulation',
            'basic-data-processing',
            'linear-regression-training',
        ]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('research_lab', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_default_experiments, reverse_code=unseed_default_experiments),
    ]
