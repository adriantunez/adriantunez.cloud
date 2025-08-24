#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { envConfig, Environment, globalTags } from '../config/environments';
import { OIDCProviderStack } from '../lib/oidc-provider-stack';
import { OidcCdkRolesStack } from '../lib/oidc-cdk-roles-stack';

const app = new App();
const currEnv = app.node.tryGetContext("environment") as Environment || Environment.PROD;
const cfg = envConfig[currEnv]

console.log("Selected config:");
console.log(cfg);

// Supercharge tags with env-specific ones
const customTags = { 
  ...globalTags, 
  Environment: currEnv,
};

// Create OIDC providers
const oidcProviderStack = new OIDCProviderStack(app, `OIDCProviderStack-${cfg.currEnv}`, {
  env: cfg.awsConfig,
  currEnv: cfg.currEnv,
  globalTags: customTags,
});

// Create CDK OIDC Roles (diff and deploy) to be used by any app that relies on CDK
new OidcCdkRolesStack(app, `OidcCdkRolesStack-${cfg.currEnv}`, {
  env: cfg.awsConfig,
  currEnv: cfg.currEnv,
  globalTags: customTags,
  oidcProviderArn: oidcProviderStack.ghOidcProviderArn,
  oidcSubjects: cfg.oidcSubjectsCdk,
});