from django.core.management.base import BaseCommand

from research_lab.models import Experiment


class Command(BaseCommand):
    help = 'Create default research lab experiments (idempotent).'

    def handle(self, *args, **options):
        defaults = [
            {
                'slug': 'gbm-simulation',
                'name': 'GBM Simulation',
                'description': 'Monte Carlo simulation (geometric Brownian motion) using stdlib only.',
                'experiment_type': Experiment.ExperimentType.SIMULATION,
                'is_active': True,
            },
            {
                'slug': 'basic-data-processing',
                'name': 'Basic Data Processing',
                'description': 'Parse numeric values from list/CSV and compute summary stats.',
                'experiment_type': Experiment.ExperimentType.DATA_PROCESSING,
                'is_active': True,
            },
            {
                'slug': 'linear-regression-training',
                'name': 'Linear Regression Training',
                'description': 'Fits y=a+b*x with closed-form least squares (stdlib only).',
                'experiment_type': Experiment.ExperimentType.MODEL_TRAINING,
                'is_active': True,
            },
        ]

        created = 0
        updated = 0
        for d in defaults:
            obj, was_created = Experiment.objects.update_or_create(slug=d['slug'], defaults=d)
            created += int(was_created)
            updated += int(not was_created)

        self.stdout.write(self.style.SUCCESS(f'Seeded research lab: created={created}, updated={updated}'))
