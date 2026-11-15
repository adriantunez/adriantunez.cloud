import { Stack, StackProps } from "aws-cdk-lib";
import { OpenIdConnectProvider } from "aws-cdk-lib/aws-iam";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

interface OIDCProviderStackProps extends StackProps {
  ssmProviderArn: string;
}

export class OIDCProviderStack extends Stack {
  constructor(scope: Construct, id: string, props: OIDCProviderStackProps) {
    super(scope, id, props);

    const githubOidcProvider = new OpenIdConnectProvider(
      this,
      "GithubOIDCProvider",
      {
        url: "https://token.actions.githubusercontent.com",
        clientIds: ["sts.amazonaws.com"],
      },
    );

    new StringParameter(this, "ProviderArnParam", {
      parameterName: props.ssmProviderArn,
      stringValue: githubOidcProvider.openIdConnectProviderArn,
    });
  }
}
