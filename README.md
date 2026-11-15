# adriantunez.cloud

[![Website](https://img.shields.io/badge/Website-adriantunez.cloud-blue?style=flat-square&logo=google-chrome)](https://adriantunez.cloud)
[![Production](https://img.shields.io/badge/Production-Enabled-brightgreen?style=flat-square)](https://adriantunez.cloud)
[![PR Previews](https://img.shields.io/badge/PR%20Previews-Enabled-brightgreen?style=flat-square)](./.github/workflows/README.md)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Enabled-brightgreen?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/adriantunez/adriantunez.cloud/actions)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support%20Me-yellow?style=flat-square&logo=buy-me-a-coffee)](https://www.buymeacoffee.com/adriantunez)

This repository hosts the source code for my personal website. A place where I openly share my own learnings as a **Platform Engineer** focused on cloud, Kubernetes and security.

Everything is automated: AWS CDK (TypeScript) manages the infrastructure, every pull request gets its own live preview, and each GitHub release deploys to production.

I decided to make it open source because I’ve always been curious about how other sites work, and I wanted to share mine openly.

## Project Structure

```
├── infrastructure/          # AWS CDK Infrastructure as Code
│   ├── bin/                # CDK application entry point
│   ├── lib/                # CDK stacks and constructs
│   ├── config/             # Single production configuration
│   ├── functions/          # CloudFront function (redirects, previews)
│   └── test/               # Infrastructure tests
├── web/                    # Hugo static site source
│   ├── content/            # Blog posts and pages
│   ├── config/             # Hugo configuration (_default, preview)
│   ├── layouts/            # Custom layouts and partials
│   ├── themes/             # Blowfish theme (git submodule)
│   └── static/             # Static assets
└── .github/workflows/      # GitHub Actions CI/CD pipelines
```

## Tech Stack

### Core Technologies

- **[Hugo](https://gohugo.io/)** — Fast and flexible static site generator
- **[Blowfish](https://blowfish.page/)** — Modern Hugo theme with excellent UX
- **[AWS CDK](https://aws.amazon.com/cdk/)** — Infrastructure as Code with TypeScript
- **[Giscus](https://giscus.app/)** — GitHub Discussions-powered comments

### AWS Services

- **S3** — Static website hosting and storage
- **CloudFront** — CDN for the site and PR previews, with a viewer-request function for redirects and preview routing
- **Route 53** — DNS (IPv4 and IPv6)
- **ACM** — TLS certificate for the site and `*.preview` subdomains
- **IAM** — Identity and access management with OIDC

### Development & CI/CD

- **GitHub Actions** — Automated testing, building, and deployment
- **Jest** — Infrastructure testing framework
- **GitHub OIDC** — Secure, keyless AWS authentication

## Deployment Workflow

1. **Pull request**: CDK tests and diff, then a preview at `https://pr<N>.preview.adriantunez.cloud/`, linked in a PR comment
2. **PR closed**: the preview is deleted
3. **Release**: CDK deploys the infrastructure, then Hugo builds and syncs the site to S3
4. **Cache**: CloudFront invalidation so changes show up right away

## Documentation

- **[Infrastructure Guide](./infrastructure/README.md)** — AWS CDK Infrastructure as Code
- **[Website Guide](./web/README.md)** — Hugo configuration and content management
- **[CI/CD Guide](./.github/workflows/README.md)** — GitHub Actions workflows

## Contact

Connect with me for discussions, collaborations, or questions:

- **Website**: [adriantunez.cloud](https://adriantunez.cloud/contact/)
- **GitHub**: [@adriantunez](https://github.com/adriantunez)
- **LinkedIn**: [adriantunez](https://www.linkedin.com/in/adriantunez/)

## Support

If you find this project helpful or interesting, consider supporting my work:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support%20Me-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://www.buymeacoffee.com/adriantunez)

Your support helps me create more content and maintain open-source projects!
