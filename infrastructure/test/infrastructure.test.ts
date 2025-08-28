import { App } from "aws-cdk-lib";
import { Environment, envConfig, globalTags } from "../config/environments";
import { OIDCProviderStack } from "../lib/oidc/oidcProviderStack";
import { OidcCdkRolesStack } from "../lib/oidc/oidcCdkRolesStack";
import { WebHostingStack } from "../lib/web-hosting/webHostingStack";
import { OidcWebRolesStack } from "../lib/oidc/oidcWebRolesStack";

// OIDCProviderStack tests
describe("Basic init OIDCProviderStack test for all environments", () => {
  Object.values(Environment).forEach((env) => {
    test(`Test init of OIDCProviderStack for ${env} env`, () => {
      const app = new App();
      const cfg = envConfig[env];

      const stack = new OIDCProviderStack(app, `MyStack-${cfg.currEnv}`, {
        env: cfg.awsConfig,
        currEnv: cfg.currEnv,
        globalTags: globalTags,
      });

      expect(stack).toBeDefined();
    });
  });
});

// OidcCdkRolesStack tests
describe("Basic init OidcCdkRolesStack test for all environments", () => {
  Object.values(Environment).forEach((env) => {
    test(`Test init of OidcCdkRolesStack for ${env} env`, () => {
      const app = new App();
      const cfg = envConfig[env];

      const stack = new OidcCdkRolesStack(app, `MyStack-${cfg.currEnv}`, {
        env: cfg.awsConfig,
        currEnv: cfg.currEnv,
        globalTags: globalTags,
        oidcProviderArn: `arn:aws:iam::${cfg.awsConfig.account}:oidc-provider/token.actions.githubusercontent.com`,
        oidcSubjects: cfg.oidcSubjectsCdk,
      });

      expect(stack).toBeDefined();
    });
  });
});

// WebHostingStack tests
describe("Basic init WebHostingStack test for all environments", () => {
  Object.values(Environment).forEach((env) => {
    test(`Test init of WebHostingStack for ${env} env`, () => {
      const app = new App();
      const cfg = envConfig[env];

      const testStringParameterNames = {
        bucketName: "myBucketStringParameterName",
        distributionId: "myDistributionIdParameterName",
      };

      // override webHosting.ssmStringParameterNames
      cfg.webHosting.ssmStringParameterNames = testStringParameterNames;

      const stack = new WebHostingStack(app, `MyStack-${cfg.currEnv}`, {
        env: cfg.awsConfig,
        currEnv: cfg.currEnv,
        globalTags: globalTags,
        webHosting: cfg.webHosting,
      });

      expect(stack).toBeDefined();
    });
  });
});

// OidcWebRolesStack tests
describe("Basic init OidcWebRolesStack test for all environments", () => {
  Object.values(Environment).forEach((env) => {
    test(`Test init of OidcWebRolesStack for ${env} env`, () => {
      const app = new App();
      const cfg = envConfig[env];

      const testStringParameterNames = {
        bucketName: "myBucketStringParameterName",
        distributionId: "myDistributionIdParameterName",
      };

      const stack = new OidcWebRolesStack(app, `MyStack-${cfg.currEnv}`, {
        env: cfg.awsConfig,
        currEnv: cfg.currEnv,
        globalTags: globalTags,
        oidcProviderArn: `arn:aws:iam::${cfg.awsConfig.account}:oidc-provider/token.actions.githubusercontent.com`,
        oidcSubjects: cfg.oidcSubjectsWeb,
        stringParameterNames: testStringParameterNames,
      });

      expect(stack).toBeDefined();
    });
  });
});
