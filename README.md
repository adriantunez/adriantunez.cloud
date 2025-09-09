# adriantunez.cloud

[![Website](https://img.shields.io/badge/Website-adriantunez.cloud-blue?style=flat-square&logo=google-chrome)](https://adriantunez.cloud)
[![Production](https://img.shields.io/badge/Production-Enabled-brightgreen?style=flat-square)](https://adriantunez.cloud)
[![Staging](https://img.shields.io/badge/Staging-Disabled-lightgrey?style=flat-square)](#)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Enabled-brightgreen?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/adriantunez/adriantunez.cloud/actions)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support%20Me-yellow?style=flat-square&logo=buy-me-a-coffee)](https://www.buymeacoffee.com/adriantunez)

This repository hosts the source code for my personal website. A place where I openly share my own learnings as an **AWS Cloud Architect, Platform Engineer, and SRE enthusiast**.

Right now, this repo is a fully automated repository which configures the infrastructure resources through AWS CDK Typescript, as well as an automated webpage deployment for both staging and production environments.

I decided to make it open source because I’ve always been curious about how other sites work, and I wanted to share mine openly.

## Project Structure

```
├── infrastructure/          # AWS CDK Infrastructure as Code
│   ├── bin/                # CDK application entry point
│   ├── lib/                # CDK stacks and constructs
│   ├── config/             # Environment configurations
│   └── test/               # Infrastructure tests
├── web/                    # Hugo static site source
│   ├── content/            # Blog posts and pages
│   ├── config/             # Hugo configuration
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
- **CloudFront** — Global CDN for fast content delivery
- **Route 53** — DNS management and domain registration
- **ACM** — SSL/TLS certificate management
- **IAM** — Identity and access management with OIDC

### Development & CI/CD

- **GitHub Actions** — Automated testing, building, and deployment
- **Jest** — Infrastructure testing framework
- **GitHub OIDC** — Secure, keyless AWS authentication

## Deployment Workflow

1. **Pull Request**: Automated testing of infrastructure and content
2. **Release Creation**: Triggers production deployment
3. **Infrastructure**: CDK deploys AWS resources
4. **Content**: Hugo builds and deploys static site to S3
5. **Cache**: CloudFront cache invalidation for immediate updates

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
