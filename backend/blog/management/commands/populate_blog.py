from django.core.management.base import BaseCommand
from blog.models import BlogPost


class Command(BaseCommand):
    help = 'Populate blog with sample posts'

    def handle(self, *args, **options):
        blog_posts = [
            {
                'title': 'Building Scalable Cloud Infrastructure with OpenStack',
                'excerpt': 'Learn how to design and deploy scalable cloud infrastructure using OpenStack. We cover orchestration, networking, and best practices.',
                'content': '''OpenStack is one of the most powerful open-source cloud computing platforms available today. In this comprehensive guide, we'll explore how to build scalable, enterprise-grade cloud infrastructure.

## Core Components

OpenStack consists of several key components:

- **Nova**: Compute service for managing virtual machines
- **Neutron**: Networking service for SDN and virtual networking
- **Glance**: Image service for managing VM images
- **Cinder**: Block storage service for persistent volumes
- **Keystone**: Identity and authentication service
- **Horizon**: Web-based dashboard for management

## Architecture Design

When designing your OpenStack infrastructure, consider:

1. High availability across multiple availability zones
2. Network isolation and security groups
3. Storage redundancy and backup strategies
4. Monitoring and logging across all components
5. Disaster recovery and failover mechanisms

## Best Practices

1. Use OVN for advanced networking capabilities
2. Implement proper RBAC policies
3. Monitor performance metrics continuously
4. Regular backups of all critical data
5. Test your disaster recovery procedures regularly

By following these practices, you can build a robust, scalable cloud infrastructure that meets enterprise requirements.''',
                'category': 'cloud',
                'tags': 'OpenStack, Cloud, Infrastructure, Virtualization',
                'is_published': True,
                'read_time': 8,
            },
            {
                'title': 'Getting Started with Kubernetes Deployments',
                'excerpt': 'Master Kubernetes deployments, scaling, and orchestration. Perfect for container management at scale.',
                'content': '''Kubernetes has become the industry standard for container orchestration. This guide walks you through deployment strategies and best practices.

## What is Kubernetes?

Kubernetes (K8s) is an open-source container orchestration platform that automates:
- Deployment
- Scaling
- Management of containerized applications

## Key Concepts

### Pods
The smallest deployable units in Kubernetes, typically containing one or more containers.

### Services
Abstracts away pod complexity and exposes containers to the network.

### Deployments
Describes desired state and manages replica sets to maintain availability.

### ConfigMaps and Secrets
Manage configuration and sensitive data separately from your code.

## Deployment Strategy

1. Create a docker image of your application
2. Define Kubernetes manifests (YAML files)
3. Use deployments for managing replicas
4. Expose services for network access
5. Monitor and scale based on metrics

## Production Considerations

- Use resource limits and requests
- Implement health checks (liveness and readiness probes)
- Use persistent volumes for data storage
- Implement proper RBAC policies
- Monitor cluster health and pod metrics

With Kubernetes, you gain powerful orchestration capabilities for your containerized workloads.''',
                'category': 'devops',
                'tags': 'Kubernetes, Docker, Containers, Orchestration',
                'is_published': True,
                'read_time': 10,
            },
            {
                'title': 'AI/ML Model Deployment on GPU Clusters',
                'excerpt': 'Optimize AI and ML model deployment on GPU clusters for production workloads.',
                'content': '''Deploying machine learning models to production requires careful consideration of performance, scalability, and cost optimization.

## GPU Selection

Choose the right GPU for your workload:
- **NVIDIA A100**: For large-scale training and inference
- **NVIDIA V100**: Good balance of performance and cost
- **NVIDIA T4**: Cost-effective for inference
- **AWS Neuron**: Custom chips for AWS services

## Deployment Frameworks

Popular frameworks for ML deployment:

### TensorFlow Serving
- Optimized for TensorFlow models
- High performance inference
- Multiple version management

### ONNX Runtime
- Framework agnostic
- Cross-platform compatibility
- Good performance

### Kubernetes for ML
- Pod scheduling and management
- Horizontal scaling
- Service management

## Optimization Techniques

1. **Model Quantization**: Reduce model size and improve inference speed
2. **Batch Processing**: Optimize throughput with batching
3. **Caching**: Reduce redundant computations
4. **Load Balancing**: Distribute inference across GPUs
5. **Monitoring**: Track latency, throughput, and GPU utilization

## Cost Optimization

- Use spot instances for non-critical workloads
- Right-size GPU allocation based on workload
- Implement auto-scaling policies
- Monitor and optimize resource utilization

Proper deployment strategy ensures your ML models perform optimally in production environments.''',
                'category': 'ai',
                'tags': 'AI, ML, GPU, TensorFlow, Deployment',
                'is_published': True,
                'read_time': 12,
            },
            {
                'title': 'Infrastructure as Code with Terraform and Ansible',
                'excerpt': 'Automate infrastructure provisioning and configuration management using IaC tools.',
                'content': '''Infrastructure as Code (IaC) enables you to manage infrastructure through code, providing consistency, repeatability, and version control.

## Why Infrastructure as Code?

Benefits of IaC:
- Reproducible environments
- Version control for infrastructure
- Faster deployment cycles
- Easier disaster recovery
- Clear documentation

## Terraform Basics

Terraform is an IaC tool for provisioning cloud infrastructure.

### Key Concepts
- **Resources**: Infrastructure objects (VMs, networks, storage)
- **State**: Current infrastructure state
- **Modules**: Reusable infrastructure templates
- **Variables**: Input values for flexibility

### Workflow
1. Write infrastructure code
2. Plan changes (preview)
3. Apply changes
4. Manage state

## Ansible for Configuration

Ansible automates system configuration and application deployment.

### Advantages
- Agentless (uses SSH)
- Simple YAML syntax
- Idempotent operations
- Large community and modules

### Best Practices
- Use roles for organization
- Separate variables by environment
- Use version control
- Test in staging first

## Integration

Combine Terraform and Ansible:
1. Use Terraform for infrastructure provisioning
2. Use Ansible for system configuration
3. Version control both
4. Automate the entire workflow

IaC provides the foundation for reliable, scalable infrastructure management.''',
                'category': 'infrastructure',
                'tags': 'Terraform, Ansible, IaC, DevOps, Automation',
                'is_published': True,
                'read_time': 9,
            },
            {
                'title': 'Security Best Practices for Cloud Infrastructure',
                'excerpt': 'Essential security measures to protect your cloud infrastructure from threats.',
                'content': '''Security is paramount when managing cloud infrastructure. This comprehensive guide covers essential security practices.

## Security Layers

Implement security at multiple layers:

### Network Security
- Firewalls and security groups
- VPN for secure access
- DDoS protection
- Network segmentation

### Identity and Access
- Strong authentication (MFA)
- Role-based access control (RBAC)
- Service accounts with minimal privileges
- Regular access reviews

### Data Security
- Encryption at rest and in transit
- Key management practices
- Secure backups
- Data classification

### Application Security
- Secure coding practices
- Regular security updates
- Dependency scanning
- Code review processes

## Common Threats

Be aware of common vulnerabilities:
1. SQL injection
2. Cross-site scripting (XSS)
3. Insecure deserialization
4. Broken authentication
5. Sensitive data exposure

## Compliance and Monitoring

- Monitor for suspicious activities
- Regular security audits
- Compliance with standards (SOC 2, ISO 27001)
- Incident response procedures

## Tools and Services

- AWS GuardDuty for threat detection
- CloudTrail for audit logging
- Security scanning tools
- Intrusion detection systems

By implementing these practices, you create a strong security posture for your infrastructure.''',
                'category': 'security',
                'tags': 'Security, Cloud, Best Practices, Encryption',
                'is_published': True,
                'read_time': 11,
            },
            {
                'title': 'CI/CD Pipeline Implementation Guide',
                'excerpt': 'Build efficient CI/CD pipelines for automated testing and deployment.',
                'content': '''Continuous Integration and Continuous Deployment (CI/CD) are essential practices for modern software development.

## CI/CD Concepts

### Continuous Integration
Developers integrate code frequently into a shared repository, with automated testing on each commit.

### Continuous Deployment
Automatically deploy tested code to production.

## Pipeline Stages

A typical CI/CD pipeline includes:

1. **Source Control**: Code push triggers pipeline
2. **Build**: Compile code and create artifacts
3. **Test**: Run automated tests
   - Unit tests
   - Integration tests
   - End-to-end tests
4. **Deploy**: Release to environments
   - Staging environment first
   - Production deployment
5. **Monitor**: Track application health

## Tools

Popular CI/CD tools:
- Jenkins: Open-source automation server
- GitLab CI: Built into GitLab
- GitHub Actions: GitHub native solution
- CircleCI: Cloud-based CI/CD
- CloudPipeline: Cloud-native option

## Best Practices

1. **Automate Everything**: Tests, builds, deployments
2. **Fast Feedback**: Quick pipeline execution
3. **Reproducible**: Same results across environments
4. **Safe Deployments**: Canary and blue-green deployments
5. **Monitor Quality**: Code coverage, security scans

## Example Pipeline

```
Code Push → Build → Unit Tests → Integration Tests → 
Deploy to Staging → Smoke Tests → Deploy to Production → Monitor
```

Effective CI/CD pipelines enable rapid, reliable delivery of software.''',
                'category': 'devops',
                'tags': 'CI/CD, Jenkins, GitLab, Automation, Pipeline',
                'is_published': True,
                'read_time': 8,
            },
        ]

        for post_data in blog_posts:
            post, created = BlogPost.objects.get_or_create(
                title=post_data['title'],
                defaults={k: v for k, v in post_data.items() if k != 'title'}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created blog post: {post.title}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Blog post already exists: {post.title}')
                )

        self.stdout.write(
            self.style.SUCCESS('Successfully populated blog posts!')
        )
