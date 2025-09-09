import { App } from "aws-cdk-lib";
import { Environment, envConfig, globalTags } from "../config/environments";
import { OIDCProviderStack } from "../lib/oidc/oidcProviderStack";
import { OidcCdkRolesStack } from "../lib/oidc/oidcCdkRolesStack";
import { WebHostingStack } from "../lib/web-hosting/webHostingStack";
import { OidcWebRolesStack } from "../lib/oidc/oidcWebRolesStack";

Object.values(Environment).forEach((env) => {
  const app = new App();
  const cfg = envConfig[env];

  // OIDCProviderStack tests
  describe("Basic init OIDCProviderStack test", () => {
    test(`Test init of OIDCProviderStack for ${env} env`, () => {
      const stack = new OIDCProviderStack(
        app,
        `OIDCProviderStack-${cfg.currEnv}`,
        {
          env: cfg.awsConfig,
          currEnv: cfg.currEnv,
          globalTags: globalTags,
          ssmStringParameterProviderArn: cfg.ssmStringParameterProviderArn,
        }
      );
      expect(stack).toBeDefined();
    });
  });

  // OidcCdkRolesStack tests
  describe("Basic init OidcCdkRolesStack test", () => {
    test(`Test init of OidcCdkRolesStack for ${env} env`, () => {
      const stack = new OidcCdkRolesStack(
        app,
        `OidcCdkRolesStack-${cfg.currEnv}`,
        {
          env: cfg.awsConfig,
          currEnv: cfg.currEnv,
          globalTags: globalTags,
          ssmStringParameterProviderArn: cfg.ssmStringParameterProviderArn,
          oidcSubjects: cfg.oidcSubjectsCdk,
        }
      );
      expect(stack).toBeDefined();
    });
  });

  // WebHostingStack tests
  describe("Basic init WebHostingStack test", () => {
    test(`Test init of WebHostingStack for ${env} env`, () => {
      const testStringParameterNames = {
        bucketName: "myBucketStringParameterName",
        distributionId: "myDistributionIdParameterName",
      };
      const stack = new WebHostingStack(app, `WebHostingStack-${cfg.currEnv}`, {
        env: cfg.awsConfig,
        currEnv: cfg.currEnv,
        globalTags: globalTags,
        webHosting: cfg.webHosting,
      });
      expect(stack).toBeDefined();
    });
  });

  // OidcWebRolesStack tests
  describe("Basic init OidcWebRolesStack test", () => {
    test(`Test init of OidcWebRolesStack for ${env} env`, () => {
      const testStringParameterNames = {
        bucketName: "myBucketStringParameterName",
        distributionId: "myDistributionIdParameterName",
      };
      const stack = new OidcWebRolesStack(
        app,
        `OidcWebRolesStack-${cfg.currEnv}`,
        {
          env: cfg.awsConfig,
          currEnv: cfg.currEnv,
          globalTags: globalTags,
          ssmStringParameterProviderArn: cfg.ssmStringParameterProviderArn,
          oidcSubjects: cfg.oidcSubjectsWeb,
          ssmStringParameterNamesWebHosting:
            cfg.webHosting.ssmStringParameterNamesWebHosting,
        }
      );
      expect(stack).toBeDefined();
    });
  });
});
