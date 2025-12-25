from django.core.management.base import BaseCommand
from django.utils.text import slugify
from blog.models import BlogPost


SAMPLE_POSTS = [
    {
        "title": "Designing a Scalable Cloud Architecture on AWS",
        "excerpt": "A practical walkthrough of VPC design, networking, and infrastructure as code.",
        "content": "In this post, we explore building a highly available architecture on AWS using VPC, subnets, NAT gateways, and IaC with Terraform...",
        "author": "atonixdev",
        "category": "cloud",
        "featured_image": "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=1200",
        "tags": "aws,cloud,architecture,terraform",
        "is_published": True,
        "read_time": 7,
    },
    {
        "title": "Production-ready Django + Docker: Best Practices",
        "excerpt": "Secure settings, health checks, multi-stage builds, and reverse proxy tips.",
        "content": "We cover key elements to containerize Django with Docker: multi-stage builds, environment-driven settings, database connectivity, static files, and proxy headers...",
        "author": "atonixdev",
        "category": "devops",
        "featured_image": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200",
        "tags": "django,docker,devops,production",
        "is_published": True,
        "read_time": 6,
    },
    {
        "title": "Getting Started with Practical Machine Learning",
        "excerpt": "A gentle intro to ML pipelines, evaluation, and deployment.",
        "content": "This tutorial introduces end-to-end ML: data prep, model training, evaluation, and serving via simple APIs. We also touch on monitoring drift...",
        "author": "atonixdev",
        "category": "ai",
        "featured_image": "https://images.unsplash.com/photo-1554475901-4538ddfbccc5?w=1200",
        "tags": "ml,ai,tutorial,python",
        "is_published": True,
        "read_time": 8,
    },
    {
        "title": "Secure API Gateways with NGINX and JWT",
        "excerpt": "How to protect APIs with reverse proxies, rate limiting, and JWT.",
        "content": "We configure NGINX as an API gateway with JWT validation hints, upstream health checks, and DoS protections...",
        "author": "atonixdev",
        "category": "security",
        "featured_image": "https://images.unsplash.com/photo-1517249361621-f11084eb8b5b?w=1200",
        "tags": "security,api,nginx,jwt",
        "is_published": True,
        "read_time": 5,
    },
    {
        "title": "CI/CD Pipelines with GitHub Actions",
        "excerpt": "Build, test, and deploy Dockerized apps using Actions workflows.",
        "content": "From linting to multi-stage builds and environment matrices, we outline practical CI/CD for container apps...",
        "author": "atonixdev",
        "category": "devops",
        "featured_image": "https://images.unsplash.com/photo-1518770660438-463f0f9d0f62?w=1200",
        "tags": "cicd,github actions,docker,devops",
        "is_published": True,
        "read_time": 6,
    },
    {
        "title": "Observability: Metrics, Logs, and Traces",
        "excerpt": "Setting up Prometheus, Loki, and Tempo for modern apps.",
        "content": "We assemble an OSS observability stack and instrument a service to export metrics, logs, and distributed traces...",
        "author": "atonixdev",
        "category": "infrastructure",
        "featured_image": "https://images.unsplash.com/photo-1526378722484-cc4b52c2f76f?w=1200",
        "tags": "observability,prometheus,grafana,loki,tempo",
        "is_published": True,
        "read_time": 7,
    },
    {
        "title": "PostgreSQL Tips for Django",
        "excerpt": "Connections, migrations, and JSON fields done right.",
        "content": "Best practices for Django + Postgres: connection pooling, transaction management, and advanced field types like JSONB...",
        "author": "atonixdev",
        "category": "tutorial",
        "featured_image": "https://images.unsplash.com/photo-1518770660438-463f0f9d0f62?w=1200",
        "tags": "django,postgres,db,jsonb",
        "is_published": True,
        "read_time": 5,
    },
    {
        "title": "Modern Frontend: React + Tailwind",
        "excerpt": "Ship faster with utility-first CSS and component patterns.",
        "content": "We demonstrate practical UI composition with Tailwind, state management approaches, and performance tweaks for React apps...",
        "author": "atonixdev",
        "category": "tutorial",
        "featured_image": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200",
        "tags": "react,tailwind,frontend,performance",
        "is_published": True,
        "read_time": 6,
    },
    {
        "title": "Container Security Essentials",
        "excerpt": "Minimize image attack surface, secrets, and supply chain risks.",
        "content": "We walk through least-privilege images, dependency pinning, vulnerability scanning, and runtime hardening...",
        "author": "atonixdev",
        "category": "security",
        "featured_image": "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1200",
        "tags": "security,containers,supply chain,devsecops",
        "is_published": True,
        "read_time": 7,
    },
    {
        "title": "Scaling Services with Async Python",
        "excerpt": "Intro to async I/O, concurrency, and performance patterns.",
        "content": "We cover asyncio, async DB drivers, and non-blocking network patterns to scale I/O-bound workloads...",
        "author": "atonixdev",
        "category": "tutorial",
        "featured_image": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200",
        "tags": "python,asyncio,performance,scaling",
        "is_published": True,
        "read_time": 8,
    },
    {
        "title": "Edge Caching with CDNs",
        "excerpt": "Use cache-control, ETags, and immutable assets to speed up UX.",
        "content": "We configure CDN caching strategies, versioned assets, and cache busting to improve end-user performance...",
        "author": "atonixdev",
        "category": "infrastructure",
        "featured_image": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200",
        "tags": "cdn,caching,performance,assets",
        "is_published": True,
        "read_time": 5,
    },
    {
        "title": "Practical API Design Principles",
        "excerpt": "Consistency, pagination, errors, and versioning for long-lived APIs.",
        "content": "Guidelines and examples for designing maintainable REST APIs, including pagination, error envelopes, and evolvable contracts...",
        "author": "atonixdev",
        "category": "tutorial",
        "featured_image": "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=1200",
        "tags": "api,design,rest,pagination",
        "is_published": True,
        "read_time": 6,
    },
]


class Command(BaseCommand):
    help = "Add sample blog posts for initial content"

    def handle(self, *args, **options):
        created = 0
        for data in SAMPLE_POSTS:
            slug = slugify(data["title"])
            obj, was_created = BlogPost.objects.update_or_create(
                slug=slug,
                defaults={
                    "title": data["title"],
                    "excerpt": data["excerpt"],
                    "content": data["content"],
                    "author": data["author"],
                    "category": data["category"],
                    "featured_image": data["featured_image"],
                    "tags": data["tags"],
                    "is_published": data["is_published"],
                    "read_time": data["read_time"],
                },
            )
            created += 1 if was_created else 0

        self.stdout.write(self.style.SUCCESS(f"Sample blogs ready. Created: {created}, total: {BlogPost.objects.count()}"))
