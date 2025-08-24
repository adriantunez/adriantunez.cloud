# Infrastructure Guidelines

This directory contains all Infrastructure as Code (IaC) and deployment automation for the adriantunez.cloud project.

## Purpose
- Provision AWS resources for the website and supporting services (partially done, yet to be finished).
- Separate roles and stacks for infrastructure and Hugo deployments.
- By now, support only production environment.

## Structure
- `bin/`: CDK app entrypoint.
- `lib/`: CDK stacks (OIDC roles, provider, web roles).
- `config/`: Environment configs and shared functions (utils).
- `test/`: Infrastructure tests.

## Deployment
- Use AWS CDK for resource provisioning.

## Related Docs
- [Main README](../README.md)
- [Website (Hugo) details](../web/README.md)
- [CI/CD Workflows](../.github/workflows/README.md)