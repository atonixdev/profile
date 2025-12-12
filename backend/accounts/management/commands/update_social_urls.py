from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import Profile

class Command(BaseCommand):
    help = 'Update profile with social media URLs and detailed information'

    def handle(self, *args, **options):
        try:
            # Get the user
            user = User.objects.get(username='atonixdev')
            
            profile, created = Profile.objects.get_or_create(
                user=user,
                defaults={
                    'full_name': 'atonixdev',
                    'title': 'Founder & Technical Architect at AtonixCorp',
                    'bio': 'Building sovereign infrastructure for Africa with cloud architecture, AI systems, DevOps pipelines, and high-performance computing under a mission of digital independence and long-term innovation.',
                    'about': '''atonixdev is the founder and technical architect behind AtonixCorp, an infrastructure company focused on building scalable, secure, and developer-ready ecosystems for Africa and the global market. Their work spans cloud infrastructure, AI systems, DevOps pipelines, and high-performance computing — all unified under a mission of digital independence and long-term innovation.

Core Infrastructure Expertise:
• OpenStack Cloud Architecture: Designs and deploys distributed cloud environments using OpenStack for full cloud orchestration, bare-metal and virtualized compute clusters, OVN/OVS networking and custom CNI plugins, multi-region replication and failover, secure tenant isolation and role-based access.

• Neuron Data Center Engineering: Architects high-performance compute environments optimized for AI/ML workloads, GPU and Neuron accelerators, containerized microservices, scientific and financial computation, edge-to-cloud data pipelines.

• Communication & Marketing Infrastructure: Enterprise Email Center with custom SMTP servers, DKIM, SPF, DMARC authentication, encrypted mail routing, notification APIs. AI-Driven Marketing Automation with segmentation engines, behavioral triggers, AI-generated outreach, campaign analytics, multi-channel delivery.

• DevOps, CI/CD & Software Engineering: Builds end-to-end DevOps pipelines using Git, GitHub, Gerrit, Jenkins, GitLab CI, GitHub Actions, Docker & nerdctl containerization, automated testing and security scanning, zero-downtime deployment workflows.

• Systems Programming & AI Development: Low-level systems programming in C/C++, backend service optimization, AI application development (Python, TensorFlow, PyTorch), model deployment on GPU and Neuron clusters, API design for AI-powered features.

Vision & Mission: atonixdev's long-term mission is to build sovereign African infrastructure, innovation hubs in Stellenbosch, Techno Park, and beyond, platforms that combine finance, science, and community empowerment, systems that reduce dependency and increase digital autonomy.''',
                    'email': 'admin@atonixdev.com',
                    'location': 'Stellenbosch, South Africa',
                    'skills': [
                        'OpenStack', 'Cloud Architecture', 'AI/ML', 'DevOps', 'CI/CD',
                        'Docker', 'Kubernetes', 'Python', 'C/C++', 'TensorFlow', 'PyTorch',
                        'Git', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'Infrastructure as Code'
                    ]
                }
            )
            
            # Update social media URLs
            profile.linkedin_url = 'https://linkedin.com/in/atonixdev'
            profile.github_url = 'https://github.com/atonixdev'
            profile.twitter_url = 'https://twitter.com/atonixdev'
            profile.gitlab_url = 'https://gitlab.com/atonixdev'
            profile.save()

            self.stdout.write(self.style.SUCCESS('Successfully updated profile with social media URLs and detailed information'))

        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('User "atonixdev" not found'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error updating profile: {e}'))