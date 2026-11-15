# CI/CD Workflows

> GitHub Actions workflows for automated testing, previews and deployment of both the infrastructure and the webpage.

## Workflow Structure

```
.github/workflows/
├── production.yml              # Production deployment (release-triggered)
├── pr.yaml                     # Pull request validation and preview
├── pr-cleanup.yaml             # Deletes the PR preview when the PR closes
├── reusable-dispatcher.yml     # Change detection (skips runs without relevant changes)
├── reusable-cdk-tests.yml      # CDK tests and npm audit
├── reusable-cdk.yml            # cdk diff or cdk deploy
└── reusable-hugo.yml           # Hugo build, optional upload to S3 and cache invalidation
```

## Workflows

### `production.yml` - Production Deployment

- **Trigger**: Release created (GitHub releases)
- **Steps**:
  1. Detect changes using the dispatcher (skip the run if nothing relevant changed)
  2. Run CDK tests
  3. Deploy infrastructure (`prod-infrastructure` environment)
  4. Build Hugo with `--environment production` and sync it to the bucket root (`prod-web` environment). The `previews/` folder is left untouched.

### `pr.yaml` - Pull Request Validation

- **Trigger**: Pull request opened, updated or reopened
- **Steps**:
  1. Detect changes using the dispatcher
  2. Run CDK tests and `cdk diff`
  3. Build Hugo with `--environment preview` and upload it to `previews/pr<N>/`
  4. Comment the preview URL (`https://pr<N>.preview.adriantunez.cloud/`) on the PR, updating the same comment on every push
  5. All-good job to allow PR merge only when everything's good

> **Note: The all-good job is a trick to enforce PR GHA success validation before merging, but only if relevant changes have been done.**

Pull requests from forks and Dependabot get no AWS credentials, so they only build.

### `pr-cleanup.yaml` - Preview Cleanup

- **Trigger**: Pull request closed or merged
- **Steps**: Delete `previews/pr<N>/` and invalidate the cache
- Shares the `preview-pr<N>` concurrency group with `pr.yaml`, so closing a PR cancels a running preview deploy first

## Reusable Workflows

### `reusable-dispatcher.yml`

- Path-based filtering (`.github/filters.yml`) to detect relevant changes
- Outputs a boolean flag for conditional job execution

### `reusable-cdk-tests.yml`

- Jest infrastructure tests
- Dependency vulnerability audit (non-blocking)

### `reusable-cdk.yml`

- Runs `cdk diff` or `cdk deploy` for all stacks
- Inputs: `COMMAND` (diff or deploy), `ROLE_NAME`, optional `GHA_ENVIRONMENT`

### `reusable-hugo.yml`

- Hugo build with minification (version read from `.tool-versions`)
- Optional upload: bucket root for production, `S3_PREFIX` (e.g. `previews/pr12`) for previews
- CloudFront invalidation of `/*` (preview URLs are rewritten before caching, so a narrower path could miss cached pages)

## Environments

| Environment | Trigger      | URL                                      | Hugo environment |
| ----------- | ------------ | ---------------------------------------- | ---------------- |
| Production  | Release      | `https://adriantunez.cloud`              | `production`     |
| PR preview  | Pull request | `https://pr<N>.preview.adriantunez.cloud` | `preview` (noindex) |
| Local       | `hugo server`| `http://localhost:1313`                  | `development`    |

## Authentication

All AWS access uses GitHub OIDC, with no long-lived credentials. Role ARNs are built from the `AWS_ACCOUNT_ID` repository variable and fixed role names:

| Role                        | Used by             | GitHub OIDC subject          |
| --------------------------- | ------------------- | ---------------------------- |
| `DiffOidcCdkRole-prod`      | `cdk diff`          | `pull_request`               |
| `DeployOidcCdkRole-prod`    | `cdk deploy`        | `environment:prod-infrastructure` |
| `DeployOidcWebRole-prod`    | Production upload   | `environment:prod-web`       |
| `PreviewOidcWebRole-prod`   | Preview upload and cleanup | `pull_request`        |

## Repository Settings

- **Variables**: `AWS_ACCOUNT_ID`, `HUGO_PATH`, `INFRA_PATH`, `AUDIT_SUMMARY_FILE`
- **Environments**: `prod-infrastructure`, `prod-web`
- **Secrets**: none
