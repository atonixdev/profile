from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils.text import slugify
from community.models import CommunityMember, Discussion, Event, Resource
from datetime import datetime, timedelta
import random


class Command(BaseCommand):
    help = 'Add sample discussions, events, and resources to the community'

    def handle(self, *args, **options):
        # Create sample users and members if they don't exist
        users_data = [
            {'username': 'alex_dev', 'email': 'alex@example.com', 'first_name': 'Alex', 'last_name': 'Developer'},
            {'username': 'sarah_tech', 'email': 'sarah@example.com', 'first_name': 'Sarah', 'last_name': 'Tech'},
            {'username': 'mike_coder', 'email': 'mike@example.com', 'first_name': 'Mike', 'last_name': 'Coder'},
            {'username': 'jane_architect', 'email': 'jane@example.com', 'first_name': 'Jane', 'last_name': 'Architect'},
            {'username': 'david_fullstack', 'email': 'david@example.com', 'first_name': 'David', 'last_name': 'FullStack'},
        ]

        users = []
        for user_data in users_data:
            try:
                user, created = User.objects.get_or_create(
                    username=user_data['username'],
                    defaults={
                        'email': user_data['email'],
                        'first_name': user_data['first_name'],
                        'last_name': user_data['last_name'],
                    }
                )
                users.append(user)
                
                # Create community member
                CommunityMember.objects.get_or_create(
                    user=user,
                    defaults={
                        'role': random.choice(['member', 'contributor', 'moderator']),
                        'bio': f'{user_data["first_name"]} is a passionate {user_data["last_name"]} from our community.',
                        'expertise_areas': 'Python, JavaScript, React, Django',
                        'is_active': True,
                        'contribution_points': random.randint(50, 500)
                    }
                )
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Failed to create user/member {user_data["username"]}: {str(e)}'))

        # Sample discussions
        discussions_data = [
            {
                'title': 'Best practices for building scalable APIs',
                'category': 'tech',
                'content': 'What are the best practices for building scalable REST APIs? I\'d love to hear your experiences with different architectural patterns.',
                'tags': 'API, Architecture, REST'
            },
            {
                'title': 'React vs Vue: Which framework do you prefer?',
                'category': 'frameworks',
                'content': 'I\'m deciding between React and Vue for a new project. What are the pros and cons of each based on your experience?',
                'tags': 'React, Vue, Frontend'
            },
            {
                'title': 'Tips for remote work productivity',
                'category': 'career',
                'content': 'As remote developers, how do you stay productive and maintain work-life balance? Share your tips and tools!',
                'tags': 'Remote, Productivity, Career'
            },
            {
                'title': 'Database optimization techniques',
                'category': 'tech',
                'content': 'Let\'s discuss various database optimization techniques. What indexing strategies do you use? How do you handle slow queries?',
                'tags': 'Database, Performance, SQL'
            },
            {
                'title': 'Getting started with TypeScript',
                'category': 'learning',
                'content': 'I\'m new to TypeScript and want to learn it. What resources would you recommend? Any common pitfalls to avoid?',
                'tags': 'TypeScript, Learning, JavaScript'
            },
            {
                'title': 'Microservices vs Monolithic Architecture',
                'category': 'tech',
                'content': 'When should you choose microservices over a monolithic approach? What are the trade-offs?',
                'tags': 'Architecture, Microservices, Design'
            },
            {
                'title': 'Best tools for API testing',
                'category': 'tools',
                'content': 'What are your favorite tools for testing APIs? Postman, Insomnia, or something else? Let\'s share our workflows!',
                'tags': 'Testing, Tools, API'
            },
            {
                'title': 'Machine Learning for web developers',
                'category': 'learning',
                'content': 'As web developers, how can we incorporate ML into our projects? Any beginner-friendly frameworks?',
                'tags': 'ML, Learning, Web'
            },
        ]

        for disc_data in discussions_data:
            Discussion.objects.get_or_create(
                title=disc_data['title'],
                defaults={
                    'slug': slugify(disc_data['title']),
                    'content': disc_data['content'],
                    'category': disc_data['category'],
                    'author': CommunityMember.objects.filter(user__username='alex_dev').first() or CommunityMember.objects.first(),
                    'status': 'open',
                    'tags': disc_data['tags'],
                    'view_count': random.randint(20, 200),
                    'like_count': random.randint(5, 50),
                    'is_pinned': random.choice([True, False, False, False]),
                }
            )

        # Sample events
        events_data = [
            {
                'title': 'Web Development Masterclass',
                'description': 'Learn advanced web development techniques',
                'event_type': 'workshop',
                'is_online': True,
                'capacity': 100,
            },
            {
                'title': 'AI/ML for Developers',
                'description': 'Introduction to machine learning for web developers',
                'event_type': 'webinar',
                'is_online': True,
                'capacity': 500,
            },
            {
                'title': 'Tech Meetup: Global Developers',
                'description': 'Monthly meetup for developers from around the world',
                'event_type': 'meetup',
                'is_online': False,
                'location': 'Virtual',
                'capacity': 200,
            },
            {
                'title': 'Cloud Architecture Deep Dive',
                'description': 'Explore cloud architecture patterns and best practices',
                'event_type': 'conference',
                'is_online': True,
                'capacity': 300,
            },
            {
                'title': 'Security Best Practices',
                'description': 'Learn about security in modern web applications',
                'event_type': 'workshop',
                'is_online': True,
                'capacity': 150,
            },
        ]

        for event_data in events_data:
            Event.objects.get_or_create(
                title=event_data['title'],
                defaults={
                    'slug': slugify(event_data['title']),
                    'description': event_data['description'],
                    'event_type': event_data['event_type'],
                    'organizer': CommunityMember.objects.filter(user__username='alex_dev').first() or CommunityMember.objects.first(),
                    'event_date': datetime.now() + timedelta(days=random.randint(5, 45)),
                    'location': event_data.get('location', 'Global'),
                    'is_online': event_data['is_online'],
                    'meeting_link': 'https://meet.example.com/event' if event_data['is_online'] else None,
                    'capacity': event_data['capacity'],
                    'attendee_count': random.randint(10, event_data['capacity'] // 2),
                    'is_published': True,
                }
            )

        # Sample resources
        resources_data = [
            {
                'title': 'Django Best Practices Guide',
                'description': 'Comprehensive guide for Django development',
                'resource_type': 'guide',
                'category': 'backend',
                'difficulty_level': 'intermediate',
            },
            {
                'title': 'React Hooks Tutorial',
                'description': 'Master React Hooks for functional components',
                'resource_type': 'tutorial',
                'category': 'frontend',
                'difficulty_level': 'intermediate',
            },
            {
                'title': 'Database Design Patterns',
                'description': 'Learn essential database design patterns',
                'resource_type': 'guide',
                'category': 'database',
                'difficulty_level': 'advanced',
            },
            {
                'title': 'REST API Design Template',
                'description': 'Ready-to-use template for REST API design',
                'resource_type': 'template',
                'category': 'backend',
                'difficulty_level': 'beginner',
            },
            {
                'title': 'CSS Grid Complete Guide',
                'description': 'Master CSS Grid layout system',
                'resource_type': 'tutorial',
                'category': 'frontend',
                'difficulty_level': 'beginner',
            },
            {
                'title': 'GraphQL vs REST Comparison',
                'description': 'Detailed comparison of GraphQL and REST architectures',
                'resource_type': 'guide',
                'category': 'architecture',
                'difficulty_level': 'intermediate',
            },
        ]

        for res_data in resources_data:
            Resource.objects.get_or_create(
                title=res_data['title'],
                defaults={
                    'slug': slugify(res_data['title']),
                    'description': res_data['description'],
                    'content': res_data['description'] + '\n\nDetailed content goes here...',
                    'resource_type': res_data['resource_type'],
                    'category': res_data['category'],
                    'difficulty_level': res_data['difficulty_level'],
                    'author': CommunityMember.objects.filter(user__username='sarah_tech').first() or CommunityMember.objects.first(),
                    'view_count': random.randint(30, 300),
                    'like_count': random.randint(10, 100),
                    'featured': random.choice([True, False, False]),
                    'is_published': True,
                }
            )

        self.stdout.write(self.style.SUCCESS('Successfully added sample discussions, events, and resources!'))
