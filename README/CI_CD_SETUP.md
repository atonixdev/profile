# CI/CD Configuration Guide

This project includes comprehensive CI/CD pipeline configurations for three major Git hosting platforms:

## GitHub Actions

**Location:** `.github/workflows/ci-cd.yml`

GitHub Actions automates testing and deployment directly from your GitHub repository.

### Features:
- Backend Python tests with PostgreSQL service
- Frontend Node.js tests and builds
- Docker image building and pushing to GitHub Container Registry (GHCR)
- Automatic deployment on push to main branch

### Setup:
1. Ensure you have GitHub Secrets configured:
   - `GITHUB_TOKEN` (automatically provided by GitHub)
   
2. Push to trigger workflows:
   ```bash
   git push origin main
   ```

3. Monitor workflow status in GitHub → Actions tab

---

## GitLab CI/CD

**Location:** `.gitlab-ci.yml`

GitLab CI provides native CI/CD integration with parallel job execution.

### Features:
- Multi-stage pipeline (test, build, deploy)
- Backend tests with PostgreSQL service
- Frontend testing and artifact generation
- Docker image building and registry push
- Staging and production deployments

### Setup:
1. Add GitLab Variables (Settings → CI/CD → Variables):
   - `DEPLOY_WEBHOOK_STAGING` - Webhook URL for staging deployment
   - `DEPLOY_WEBHOOK_PRODUCTION` - Webhook URL for production deployment

2. Enable GitLab Runner (if needed):
   ```bash
   gitlab-runner register
   ```

3. Commits to main or develop branches trigger the pipeline automatically

---

## Bitbucket Pipelines

**Location:** `bitbucket-pipelines.yml`

Bitbucket Pipelines integrates CI/CD directly into Bitbucket Cloud repositories.

### Features:
- Separate pipelines for main and develop branches
- Backend and frontend testing
- Docker image building and pushing
- SSH deployment to production/staging servers
- Pull request testing triggers

### Setup:
1. Add Bitbucket Repository Variables (Repository Settings → Pipelines → Variables):
   - `DOCKER_USERNAME` - Docker Hub username
   - `DOCKER_PASSWORD` - Docker Hub password or token
   - `PRODUCTION_HOST` - Production server hostname
   - `PRODUCTION_USER` - SSH user for production
   - `STAGING_HOST` - Staging server hostname
   - `STAGING_USER` - SSH user for staging
   - `SSH_PRIVATE_KEY` - SSH private key for deployment

2. Ensure you have a Bitbucket Runner configured or use Bitbucket Cloud-hosted runners

3. Commits to branches automatically trigger appropriate pipelines

---

## Configuration Variables

### GitHub Secrets
Set these in GitHub Repository Settings → Secrets and Variables → Actions:
```
REGISTRY_PERSONAL_ACCESS_TOKEN - For private registry access
```

### GitLab Variables
Set these in GitLab Project Settings → CI/CD → Variables:
```
DEPLOY_WEBHOOK_STAGING
DEPLOY_WEBHOOK_PRODUCTION
CI_REGISTRY_USER
CI_REGISTRY_PASSWORD
```

### Bitbucket Variables
Set these in Bitbucket Repository Settings → Pipelines → Variables:
```
DOCKER_USERNAME
DOCKER_PASSWORD
PRODUCTION_HOST
PRODUCTION_USER
STAGING_HOST
STAGING_USER
SSH_PRIVATE_KEY
```

---

## Pipeline Stages

All three platforms follow similar stages:

1. **Test Stage**
   - Runs backend Python tests
   - Runs frontend Node.js tests and linting
   - Validates code quality

2. **Build Stage**
   - Builds Docker images for backend and frontend
   - Pushes images to container registry

3. **Deploy Stage**
   - Deploys to staging on develop branch commits
   - Deploys to production on main branch commits (manual trigger for Bitbucket)

---

## Local Testing

### Test Backend Locally
```bash
cd backend
python manage.py test --settings=config.settings
```

### Test Frontend Locally
```bash
cd frontend
npm test
npm run build
```

### Build Docker Images Locally
```bash
docker build -t profile-backend:latest ./backend
docker build -t profile-frontend:latest ./frontend
```

---

## Deployment Strategies

### GitHub Actions
- Automatically builds and pushes to GHCR on main branch
- Manual deployment through workflow dispatch
- Container images available at `ghcr.io/atonixdev/profile-*`

### GitLab CI
- Automatic staging deployment on develop branch
- Manual production deployment on main branch
- Images pushed to GitLab Container Registry

### Bitbucket Pipelines
- Automatic staging deployment on develop branch
- Manual production deployment on main branch (with manual trigger)
- Images pushed to Docker Hub

---

## Monitoring & Logs

**GitHub Actions:**
- View in GitHub repository → Actions tab
- See logs for each workflow run

**GitLab CI:**
- View in GitLab project → CI/CD → Pipelines
- Real-time job logs available

**Bitbucket Pipelines:**
- View in Bitbucket repository → Pipelines
- Access detailed step logs and artifacts

---

## Troubleshooting

### GitHub Actions
- Check workflow syntax with `act` CLI locally
- Ensure Docker credentials are properly set in secrets

### GitLab CI
- Verify runner is online and available
- Check pipeline syntax in CI/CD → Editor
- Review runner configuration in Admin → Runners

### Bitbucket Pipelines
- Ensure repository has Pipelines enabled
- Verify SSH key has correct permissions (600)
- Check runner status in Bitbucket admin panel

---

## Best Practices

1. **Branch Protection**: Require all checks to pass before merging
2. **Deployment Approval**: Use manual triggers for production deployments
3. **Secrets Management**: Use native secrets management for each platform
4. **Build Artifacts**: Archive build outputs for debugging
5. **Notifications**: Configure webhooks to notify on deployment status
6. **Versioning**: Tag releases and use semantic versioning for images

