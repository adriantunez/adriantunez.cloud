import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { OpenIdConnectProvider } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import type { Environment, GlobalTags } from '../../config/environments';

interface OIDCProviderStackProps extends StackProps {
  currEnv: Environment;
  globalTags: GlobalTags;
};

export class OIDCProviderStack extends Stack {
  public readonly ghOidcProviderArn: string;

  constructor(scope: Construct, id: string, props: OIDCProviderStackProps) {
    super(scope, id, props);

    // Create an OIDC Providedr for Github
    const githubOidcProvider = new OpenIdConnectProvider(this, 'GithubOIDCProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com']
    });
    this.ghOidcProviderArn = githubOidcProvider.openIdConnectProviderArn;

    // Tag all resources created by the construct (using globalTags)
    Object.entries(props.globalTags).forEach(([key, value]) => {
      Tags.of(this).add(key, value);
    });
  };
};