# Infrastructure

> AWS CDK Infrastructure as Code for adriantunez.cloud

This directory contains all Infrastructure as Code (IaC) and deployment automation for the adriantunez.cloud project, built with AWS CDK and TypeScript.

## Purpose

- **Infrastructure Provisioning**: Deploy and manage AWS resources for the website and supporting services
- **Security Management**: Implement OIDC-based authentication for GitHub Actions
- **Environment Support**: Currently supports staging & production environments
- **Automated CI/CD**: Automated testing, audit, diff and deploy of both infra and webpage

## Architecture

### CDK Stacks

1. **OIDCProviderStack**: GitHub OIDC identity provider
2. **OidcCdkRolesStack**: IAM roles for CDK deployment operations
3. **OidcWebRolesStack**: IAM roles for Hugo site deployment
4. **WebHostingStack**: S3, CloudFront, and Route 53 resources

## Directory Structure

```
infrastructure/
├── bin/
│   └── infrastructure.ts          # CDK app entry point
├── lib/
│   ├── oidc/                      # OIDC-related stacks
│   │   ├── oidcProviderStack.ts   # GitHub OIDC provider
│   │   ├── oidcCdkRolesStack.ts   # OIDC CDK deployment roles
│   │   ├── oidcWebRolesStack.ts   # OIDC Web deployment roles
│   │   └── constructs/            # Reusable CDK constructs
│   └── web-hosting/               # Web-hosting related stack
│       ├── webHostingStack.ts     # Main hosting stack
│       └── constructs/            # Reusable CDK constructs
├── config/
│   └── environments.ts           # Environment configurations
├── functions/
│   └── cf-webredirect.js         # CloudFront function for redirects
├── test/
│   └── infrastructure.test.ts    # Infrastructure tests
├── package.json                  # Node.js dependencies
├── cdk.json                      # CDK configuration
├── tsconfig.json                 # TypeScript configuration
├── .env.example                  # Environment variables template
└── .env.test                     # Environment variables used by tests
```

## Test Coverage

- **Stack Initialization**: Verify all stacks can be created without errors
- **Resource Configuration**: Validate AWS resource configurations
- **Cross-Stack Dependencies**: Ensure proper stack dependencies
- **Environment Support**: Test multiple environment configurations

## Configuration

### Environments

The project supports multiple environments configured in `config/environments.ts`:

- **Production**: Live environment with full AWS resources
- **Staging**: Testing environment with similar setup

## Security Features

- **OIDC Authentication**: No long-lived AWS credentials in GitHub
- **Least Privilege IAM**: Minimal required permissions for each role
- **Encrypted Storage**: S3 bucket encryption enabled
- **HTTPS Only**: SSL/TLS enforcement across all resources
- **Content Security**: CloudFront security headers

## Integration with GitHub Actions

The infrastructure is designed to work seamlessly with GitHub Actions:

1. **OIDC Provider**: Enables secure authentication
2. **CDK Roles**: Deploy infrastructure changes
3. **Web Roles**: Deploy Hugo site content
4. **Parameter Store**: Share configuration between stacks

More info can be found in [GHA Workflow's README.md](../.github/workflows/README.md)
