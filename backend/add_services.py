import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from services.models import Service

services_data = [
    {
        'title': 'Mobile Development',
        'description': 'Scalable, user-friendly apps for smartphones and tablets.',
        'features': ['Android App Development – Scalable, user-friendly apps for smartphones and tablets.', 'iOS App Development – Sleek, high-performance apps for iPhone and iPad.', 'Cross-Platform Solutions – One codebase, multiple platforms, faster delivery.'],
        'pricing': 'Contact for quote',
        'icon': '📱'
    },
    {
        'title': 'Artificial Intelligence & Machine Learning',
        'description': 'Smart solutions that automate tasks and enhance decision-making.',
        'features': ['AI-Powered Applications – Smart solutions that automate tasks and enhance decision-making.', 'Chatbots & Virtual Assistants – Improve customer engagement with intelligent conversational tools.', 'Predictive Analytics – Turn data into actionable insights for growth.'],
        'pricing': 'Contact for quote',
        'icon': '🤖'
    },
    {
        'title': 'Cybersecurity Solutions',
        'description': 'Protect your infrastructure from threats and breaches.',
        'features': ['Network Security – Protect your infrastructure from threats and breaches.', 'Data Protection & Encryption – Safeguard sensitive information with advanced security protocols.', 'Security Audits & Compliance – Ensure your systems meet global standards.'],
        'pricing': 'Contact for quote',
        'icon': '🔒'
    },
    {
        'title': 'Web & Software Development',
        'description': 'Tailored solutions for your business needs.',
        'features': ['Custom Web Applications – Tailored solutions for your business needs.', 'E-Commerce Platforms – Secure, scalable online stores with payment integration.', 'API Development & Integration – Seamless connectivity across systems.'],
        'pricing': 'Contact for quote',
        'icon': '💻'
    },
    {
        'title': 'Cloud & Infrastructure',
        'description': 'Reliable infrastructure for growing businesses.',
        'features': ['Cloud Migration – Move your business to AWS, Azure, or Google Cloud.', 'DevOps & Automation – Streamline deployment and operations.', 'Scalable Hosting Solutions – Reliable infrastructure for growing businesses.'],
        'pricing': 'Contact for quote',
        'icon': '☁️'
    },
    {
        'title': 'Gaming & Interactive Media',
        'description': 'Immersive solutions for training, entertainment, and marketing.',
        'features': ['Game Development – Engaging mobile and desktop games.', 'AR/VR Experiences – Immersive solutions for training, entertainment, and marketing.', 'Gamification Strategies – Boost user engagement with interactive design.'],
        'pricing': 'Contact for quote',
        'icon': '🎮'
    }
]

for data in services_data:
    Service.objects.create(**data)

print('Services added successfully!')