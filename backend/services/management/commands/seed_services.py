from django.core.management.base import BaseCommand
from services.models import Service

class Command(BaseCommand):
    help = 'Seed services data'

    def handle(self, *args, **options):
        services_data = [
            {
                'title': 'OpenStack Cloud Architecture',
                'description': 'Design and deploy distributed cloud environments using OpenStack for full cloud orchestration, bare-metal and virtualized compute clusters, OVN/OVS networking, and multi-region replication.',
                'icon': '☁️',
                'features': [
                    'Full cloud orchestration with OpenStack',
                    'Bare-metal and virtualized compute clusters',
                    'OVN/OVS networking and custom CNI plugins',
                    'Multi-region replication and failover',
                    'Secure tenant isolation and role-based access'
                ],
                'pricing': 'Custom Quote',
                'order': 1
            },
            {
                'title': 'Neuron Data Center Engineering',
                'description': 'Architect high-performance compute environments optimized for AI/ML workloads, GPU and Neuron accelerators, containerized microservices, and edge-to-cloud data pipelines.',
                'icon': '🧠',
                'features': [
                    'AI/ML workload optimization',
                    'GPU and Neuron accelerator integration',
                    'Containerized microservices architecture',
                    'Scientific and financial computation',
                    'Edge-to-cloud data pipelines'
                ],
                'pricing': 'Custom Quote',
                'order': 2
            },
            {
                'title': 'DevOps & CI/CD Pipelines',
                'description': 'Build end-to-end DevOps pipelines using Git, Jenkins, GitLab CI, Docker containerization, automated testing, security scanning, and zero-downtime deployment workflows.',
                'icon': '🔄',
                'features': [
                    'Git, GitHub, Gerrit integration',
                    'Jenkins, GitLab CI, GitHub Actions',
                    'Docker & nerdctl containerization',
                    'Automated testing and security scanning',
                    'Zero-downtime deployment workflows'
                ],
                'pricing': 'Starting at $2,500',
                'order': 3
            },
            {
                'title': 'AI & Systems Programming',
                'description': 'Low-level systems programming in C/C++, backend service optimization, AI application development with Python/TensorFlow/PyTorch, and model deployment on GPU/Neuron clusters.',
                'icon': '🤖',
                'features': [
                    'Low-level systems programming (C/C++)',
                    'Backend service optimization',
                    'AI development (Python, TensorFlow, PyTorch)',
                    'Model deployment on GPU/Neuron clusters',
                    'API design for AI-powered features'
                ],
                'pricing': 'Starting at $3,000',
                'order': 4
            },
            {
                'title': 'Enterprise Communication Infrastructure',
                'description': 'Build secure, scalable communication systems with custom SMTP servers, DKIM/SPF/DMARC authentication, encrypted mail routing, notification APIs, and synthetic email datasets.',
                'icon': '📧',
                'features': [
                    'Custom SMTP server implementation',
                    'DKIM, SPF, DMARC authentication',
                    'Encrypted mail routing',
                    'Notification APIs for apps/platforms',
                    'Synthetic email datasets for testing'
                ],
                'pricing': 'Starting at $1,500',
                'order': 5
            },
            {
                'title': 'AI-Driven Marketing Automation',
                'description': 'Design automated marketing workflows with segmentation engines, behavioral triggers, AI-generated outreach, campaign analytics, and multi-channel delivery systems.',
                'icon': '📈',
                'features': [
                    'Segmentation engines',
                    'Behavioral triggers',
                    'AI-generated outreach',
                    'Campaign analytics',
                    'Multi-channel delivery (email, SMS, in-app)'
                ],
                'pricing': 'Starting at $2,000',
                'order': 6
            }
        ]

        for service_data in services_data:
            service, created = Service.objects.get_or_create(
                title=service_data['title'],
                defaults=service_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created service: {service.title}'))
            else:
                # Update existing service
                for key, value in service_data.items():
                    setattr(service, key, value)
                service.save()
                self.stdout.write(self.style.SUCCESS(f'Updated service: {service.title}'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded services data'))