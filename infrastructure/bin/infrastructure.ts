#!/usr/bin/env node
import { App, Stack, Tags } from "aws-cdk-lib";
import { config } from "../config/config";
import { OIDCProviderStack } from "../lib/oidc/oidcProviderStack";
import { OidcCdkRolesStack } from "../lib/oidc/oidcCdkRolesStack";
import { OidcWebRolesStack } from "../lib/oidc/oidcWebRolesStack";
import { CertificateStack } from "../lib/certificate/certificateStack";
import { WebHostingStack } from "../lib/web-hosting/webHostingStack";

const app = new App();
const account = config.account;
const env = { account, region: config.region };

new OIDCProviderStack(app, "OIDCProviderStack", {
  env,
  ssmProviderArn: config.ssm.providerArn,
});

new OidcCdkRolesStack(app, `OidcCdkRolesStack-${config.environment}`, {
  env,
  envName: config.environment,
  ssmProviderArn: config.ssm.providerArn,
  diffSubjects: config.oidcSubjects.cdkDiff,
  deploySubjects: config.oidcSubjects.cdkDeploy,
});

// CloudFront only accepts certificates from us-east-1
const certificate = new CertificateStack(
  app,
  `CertificateStack-${config.environment}`,
  {
    env: { account, region: "us-east-1" },
    crossRegionReferences: true,
    web: config.web,
  },
);

new WebHostingStack(app, `WebHostingStack-${config.environment}`, {
  env,
  crossRegionReferences: true,
  certificate: certificate.certificate,
  web: config.web,
  ssm: config.ssm,
});

new OidcWebRolesStack(app, `OidcWebRolesStack-${config.environment}`, {
  env,
  envName: config.environment,
  ssm: config.ssm,
  previewPrefix: config.web.previewPrefix,
  deploySubjects: config.oidcSubjects.webDeploy,
  previewSubjects: config.oidcSubjects.webPreview,
});

for (const stack of app.node.children) {
  if (stack instanceof Stack) {
    Object.entries(config.tags).forEach(([key, value]) =>
      Tags.of(stack).add(key, value),
    );
  }
}
