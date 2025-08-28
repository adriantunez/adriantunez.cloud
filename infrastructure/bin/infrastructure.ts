#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { envConfig, Environment, globalTags } from "../config/environments";
import { OIDCProviderStack } from "../lib/oidc/oidcProviderStack";
import { OidcCdkRolesStack } from "../lib/oidc/oidcCdkRolesStack";
import { OidcWebRolesStack } from "../lib/oidc/oidcWebRolesStack";
import { WebHostingStack } from "../lib/web-hosting/webHostingStack";

const app = new App();
const currEnv =
  (app.node.tryGetContext("environment") as Environment) || Environment.PROD;
const cfg = envConfig[currEnv];

console.log("Selected config:");
console.log(cfg);

// Supercharge tags with env-specific ones
const customTags = {
  ...globalTags,
  Environment: currEnv,
};

// Create OIDC providers
const oidcProviderStack = new OIDCProviderStack(
  app,
  `OIDCProviderStack-${cfg.currEnv}`,
  {
    env: cfg.awsConfig,
    currEnv: cfg.currEnv,
    globalTags: customTags,
  },
);

// Create CDK OIDC Roles (diff and deploy) to be used by any app that relies on CDK
new OidcCdkRolesStack(app, `OidcCdkRolesStack-${cfg.currEnv}`, {
  env: cfg.awsConfig,
  currEnv: cfg.currEnv,
  globalTags: customTags,
  oidcProviderArn: oidcProviderStack.ghOidcProviderArn,
  oidcSubjects: cfg.oidcSubjectsCdk,
});

// Create web hosting
new WebHostingStack(app, `WebHostingStack-${cfg.currEnv}`, {
  env: cfg.awsConfig,
  currEnv: cfg.currEnv,
  globalTags: customTags,
  webHosting: cfg.webHosting,
});

// Create web OIDC Roles (diff and deploy) to be used by any app that relies on webHosting
new OidcWebRolesStack(app, `OidcWebRolesStack-${cfg.currEnv}`, {
  env: cfg.awsConfig,
  currEnv: cfg.currEnv,
  globalTags: customTags,
  oidcProviderArn: oidcProviderStack.ghOidcProviderArn,
  oidcSubjects: cfg.oidcSubjectsWeb,
  stringParameterNames: cfg.webHosting.ssmStringParameterNames,
});
