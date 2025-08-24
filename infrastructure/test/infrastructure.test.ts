import { App } from 'aws-cdk-lib';
import { Environment, envConfig, globalTags } from '../config/environments';
import { OIDCProviderStack } from '../lib/oidc-provider-stack';
import { OidcCdkRolesStack } from '../lib/oidc-cdk-roles-stack';

// OIDCProviderStack tests
describe('Basic init OIDCProviderStack test for all environments', () => {
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
describe('Basic init OidcCdkRolesStack test for all environments', () => {
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