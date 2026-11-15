# Infrastructure

> AWS CDK Infrastructure as Code for adriantunez.cloud

This directory contains all Infrastructure as Code (IaC) and deployment automation for the adriantunez.cloud project, built with AWS CDK and TypeScript.

## Purpose

- **Infrastructure Provisioning**: Deploy and manage AWS resources for the website and supporting services
- **Security Management**: Implement OIDC-based authentication for GitHub Actions
- **Single Environment**: One production setup that also serves PR previews
- **Automated CI/CD**: Automated testing, audit, diff and deploy of both infra and webpage

## Architecture

### CDK Stacks

1. **OIDCProviderStack**: GitHub OIDC identity provider
2. **OidcCdkRolesStack-prod**: IAM roles for `cdk diff` (pull requests) and `cdk deploy` (releases)
3. **CertificateStack-prod**: ACM certificate in us-east-1 for `adriantunez.cloud`, `www` and `*.preview`, plus a CAA record that only lets Amazon issue certificates
4. **WebHostingStack-prod**: S3 bucket, CloudFront distribution, CloudFront functions and Route 53 records
5. **OidcWebRolesStack-prod**: IAM roles to upload the site (whole bucket) and PR previews (`previews/` only)

### PR previews

Production and previews share one bucket and one distribution:

- Production lives at the bucket root and is served on `adriantunez.cloud` (`www` redirects to it).
- PR `<N>` lives under `previews/pr<N>/` and is served on `pr<N>.preview.adriantunez.cloud`.
- The CloudFront function maps preview hosts to their folder, and returns 404 for `/previews/` on the main domain.
- Previews are deleted when the PR closes, and a lifecycle rule expires anything under `previews/` after 30 days.

### CloudFront pricing plan

The distribution is on a CloudFront flat-rate pricing plan. CloudFront created its WAF web ACL with the subscription and doesn't allow removing or replacing it, so CDK only references it (`pricingPlanWebAclArn` in `config/config.ts`) and doesn't manage it. The Free plan also requires `PriceClass_All` and an AWS-managed response headers policy.

### Browser caching

`cf-response-headers.js` sets `Cache-Control` per response:

| Response | Cache-Control |
| --- | --- |
| Fingerprinted files (Hugo hash in the name) | `public, max-age=31536000, immutable` |
| HTML pages | `public, max-age=0, must-revalidate` |
| Other files | `public, max-age=86400` |
| Errors | `no-cache` |

The CloudFront edge keeps its own 1-day cache, and every deploy invalidates `/*`.

## Directory Structure

```
infrastructure/
├── bin/
│   └── infrastructure.ts          # CDK app entry point
├── lib/
│   ├── certificate/
│   │   └── certificateStack.ts    # ACM certificate (us-east-1)
│   ├── oidc/                      # OIDC-related stacks
│   │   ├── oidcProviderStack.ts   # GitHub OIDC provider
│   │   ├── oidcCdkRolesStack.ts   # OIDC CDK deployment roles
│   │   ├── oidcWebRolesStack.ts   # OIDC Web deployment roles
│   │   └── constructs/            # Reusable CDK constructs
│   └── web-hosting/               # Web-hosting related stack
│       ├── webHostingStack.ts     # Main hosting stack
│       └── constructs/            # Reusable CDK constructs
├── config/
│   └── config.ts                 # Account, region, domains, SSM names, OIDC subjects
├── functions/
│   ├── cf-webredirect.js         # Viewer request: redirects, clean URLs, preview routing
│   └── cf-response-headers.js    # Viewer response: security headers and browser caching
├── test/
│   └── infrastructure.test.ts    # Infrastructure tests
├── package.json                  # Node.js dependencies
├── cdk.json                      # CDK configuration
└── tsconfig.json                 # TypeScript configuration
```

## Test Coverage

- **Stack Initialization**: Verify all stacks can be created without errors
- **Resource Configuration**: Validate AWS resource configurations
- **IAM Scope**: The preview role only writes under `previews/`, the diff role only trusts pull requests
- **CloudFront Function**: Redirects, clean URLs and preview routing

## Configuration

Everything lives in `config/config.ts`. Nothing there is secret, so no `.env` files are needed.

### Local usage

```bash
npm ci
npm test
npm run cdk:diff      # needs AWS credentials for the account in config.ts
npm run cdk:deploy
```

The certificate stack lives in us-east-1, so both regions must be bootstrapped once:

```bash
npx cdk bootstrap aws://<account>/eu-west-1 aws://<account>/us-east-1
```

## Security Features

- **OIDC Authentication**: No long-lived AWS credentials in GitHub
- **Least Privilege IAM**: Minimal required permissions for each role
- **Encrypted Storage**: S3 bucket encryption enabled
- **HTTPS Only**: SSL/TLS enforcement across all resources
- **Security Headers**: HSTS, `frame-ancestors 'none'`, Permissions-Policy, and no `Server` header, set by a CloudFront function (the Free plan doesn't allow custom response headers policies)
- **CAA Record**: Only Amazon can issue certificates for the domain

## Integration with GitHub Actions

The infrastructure is designed to work seamlessly with GitHub Actions:

1. **OIDC Provider**: Enables secure authentication
2. **CDK Roles**: Deploy infrastructure changes
3. **Web Roles**: Deploy Hugo site content
4. **Parameter Store**: Share configuration between stacks

More info can be found in [GHA Workflow's README.md](../.github/workflows/README.md)
