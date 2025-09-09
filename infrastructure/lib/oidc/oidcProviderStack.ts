import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { OpenIdConnectProvider } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import type { Environment, GlobalTags } from "../../config/environments";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

interface OIDCProviderStackProps extends StackProps {
  currEnv: Environment;
  globalTags: GlobalTags;
  ssmStringParameterProviderArn: string;
}

export class OIDCProviderStack extends Stack {
  public readonly ghOidcProviderArn: string; // TODO: DELETEME

  constructor(scope: Construct, id: string, props: OIDCProviderStackProps) {
    super(scope, id, props);

    // Create an OIDC Providedr for Github
    const githubOidcProvider = new OpenIdConnectProvider(
      this,
      "GithubOIDCProvider",
      {
        url: "https://token.actions.githubusercontent.com",
        clientIds: ["sts.amazonaws.com"],
      }
    );

    // Export SSM Parameter Store for provider ARN
    new StringParameter(this, "ProviderArnParam", {
      parameterName: props.ssmStringParameterProviderArn,
      stringValue: githubOidcProvider.openIdConnectProviderArn,
    });

    this.ghOidcProviderArn = githubOidcProvider.openIdConnectProviderArn; // TODO: DELETEME

    // Tag all resources created by the construct (using globalTags)
    Object.entries(props.globalTags).forEach(([key, value]) => {
      Tags.of(this).add(key, value);
    });
  }
}
