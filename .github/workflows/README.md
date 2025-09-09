# CI/CD Workflows

> GitHub Actions workflows for automated testing, building, and deployment of both the infrastructure and the webpage.

This directory contains GitHub Actions workflows that automate the entire lifecycle of the adriantunez.cloud webpage project, from testing infrastructure as code to deploying the live website.

## Workflow Structure

```
.github/workflows/
├── production.yml              # Production deployment workflow (release-triggered)
├── staging.yml                 # Staging deployment workflow (main-branch triggered)
├── pr.yaml                     # Pull request validation workflow
├── reusable-dispatcher.yml     # Smart change detection, called dispatcher
├── reusable-cdk-deploy.yml     # Reusable CDK deployment
├── reusable-cdk-diff.yml       # Reusable CDK diff and audit
├── reusable-cdk-tests.yml      # Reusable CDK testing
└── reusable-hugo.yml           # Reusable Hugo build & optional deploy
```

## Workflow Types

### Main Workflow

#### `production.yml` - Production Deployment

- **Trigger**: Release created (GitHub releases)
- **Purpose**: Deploy to production environment
- **Steps**:
  1. Detect changes using dispatcher (skip run if no relevant changes)
  2. Run CDK tests across all environments
  3. Deploy infrastructure changes to production
  4. Build and deploy Hugo productionsite

#### `staging.yml` - Staging Deployment

- **Trigger**: Push to `main` branch
- **Purpose**: Deploy to staging environment for testing
- **Steps**:
  1. Detect changes using dispatcher (skip run if no relevant changes)
  2. Run CDK tests across all environments
  3. 4. Deploy infrastructure changes to staging
  4. Build and deploy staging site

#### `pr.yaml` - Pull Request Validation

- **Trigger**: Pull request to any branch
- **Purpose**: Validate changes before merge
- **Steps**:
  1. Detect changes using dispatcher
  2. Run CDK tests across all environments
  3. Run CDK diff for all environments
  4. Validate Hugo build for all environments
  5. All-good job to allow PR merge-only when everything's good

> **Note: The all-good job is a trick to enforce PR GHA success validation before merging, but only if relevant changes have been done.**

### Reusable Workflows

#### `reusable-dispatcher.yml`

- **Purpose**: Smart change detection and workflow optimization
- **Features**:
  - Path-based filtering to detect relevant changes
  - Prevents unnecessary workflow runs
  - Supports complex filter patterns including exclusions
  - Outputs boolean flag for conditional job execution

#### `reusable-cdk-tests.yml`

- **Purpose**: Run CDK infrastructure tests
- **Features**:
  - Jest-based testing framework
  - Multiple environment validation
  - Dependency vulnerability auditing

#### `reusable-cdk-diff.yml`

- **Purpose**: Generate infrastructure change previews
- **Features**:
  - Early error detection
  - Resource modification preview

#### `reusable-cdk-deploy.yml`

- **Purpose**: Deploy CDK infrastructure
- **Features**:
  - OIDC authentication for IaC & web deployment
  - OIDC roles for "readonly" (diff) and "readwrite" (deploy)
  - Environment-specific deployments

#### `reusable-hugo.yml`

- **Purpose**: Build and deploy Hugo site
- **Features**:
  - Hugo build with minification
  - S3 deployment with sync
  - CloudFront cache invalidation
  - Build artifact management

## Environments

The project supports multiple deployment environments:

### Production Environment

- **Trigger**: GitHub releases
- **Purpose**: Live production website
- **Domain**: `adriantunez.cloud`
- **Infrastructure**: Full AWS stack with production settings
- **Approval**: Manual release creation required

### Staging Environment

- **Trigger**: Push to `main` branch
- **Purpose**: Pre-production testing and validation
- **Domain**: `staging.adriantunez.cloud`
- **Infrastructure**: Production-like AWS stack for testing
- **Approval**: Automatic deployment from main

### Development

- **Trigger**: Local development
- **Purpose**: Local testing and development
- **Domain**: `localhost:1313`
- **Infrastructure**: Local Hugo server
- **Approval**: Developer-initiated
