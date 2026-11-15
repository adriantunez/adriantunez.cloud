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
    cdkDiff: [`repo:${repository}:pull_request`],
    cdkDeploy: [`repo:${repository}:environment:prod-infrastructure`],
    webDeploy: [`repo:${repository}:environment:prod-web`],
    webPreview: [`repo:${repository}:pull_request`],
  },
};

export type WebConfig = typeof config.web;
export type SsmConfig = typeof config.ssm;
