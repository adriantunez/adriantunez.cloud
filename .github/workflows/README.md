# CI/CD Workflows

This directory contains GitHub Actions workflows for automating testing, auditing, building and deploying of my my site. As well as infrastructure as code.

## Workflows
- `cdk.yml` — Deploys AWS infrastructure using CDK. It also enables AWS OIDC short-living credentials for both CDK itself and web deployment.
- `hugo.yml` — Builds and deploys the Hugo static site to AWS S3 and invalidates CloudFront cache.

## Notes
- AWS credentials and permissions are required for deployment jobs. This is done through OIDC (configured from CDK itself).
See the main [README](../../README.md) for overall project context.
- See [infrastructure/README.md](../../infrastructure/README.md) for IaC details.
- See [web/README.md](../../web/README.md) for site details.
