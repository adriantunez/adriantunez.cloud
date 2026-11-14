// Single production environment. Nothing here is secret (the account ID is
// also in cdk.context.json). Pinning the account makes CDK refuse to deploy
// with credentials for any other account.
const repository = "adriantunez/adriantunez.cloud";

export const config = {
  account: "149722328819",
  region: "eu-west-1",
  environment: "prod",
  tags: {
    RepositoryPath: `https://github.com/${repository}`,
    Project: "adriantunez.cloud",
    Environment: "prod",
  },
  web: {
    hostedZoneName: "adriantunez.cloud",
    mainDomainName: "adriantunez.cloud",
    domainNames: ["adriantunez.cloud", "www.adriantunez.cloud"],
    // PR previews are served from pr<N>.<previewDomainName>
    previewDomainName: "preview.adriantunez.cloud",
    previewPrefix: "previews",
    previewExpirationDays: 30,
  },
  ssm: {
    providerArn: "/providers/github/oidc/arn",
    bucketName: "/web/prod/bucketName",
    distributionId: "/web/prod/distributionId",
  },
  oidcSubjects: {
    cdkDiff: [`repo:${repository}:*`],
    cdkDeploy: [`repo:${repository}:environment:prod-infrastructure`],
    webDeploy: [`repo:${repository}:environment:prod-web`],
    // Pull request jobs without a GitHub environment (previews and cleanup)
    webPreview: [`repo:${repository}:pull_request`],
  },
};

export type WebConfig = typeof config.web;
export type SsmConfig = typeof config.ssm;
