import { Stack, StackProps } from "aws-cdk-lib";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { CreateIamRole } from "./constructs/createIamRole";

interface OidcCdkRolesStackProps extends StackProps {
  envName: string;
  ssmProviderArn: string;
  diffSubjects: string[];
  deploySubjects: string[];
}

export class OidcCdkRolesStack extends Stack {
  constructor(scope: Construct, id: string, props: OidcCdkRolesStackProps) {
    super(scope, id, props);

    const oidcProviderArn = StringParameter.fromStringParameterName(
      this,
      "OidcProviderArn",
      props.ssmProviderArn,
    ).stringValue;

    CreateIamRole(this, "DiffOidcCdkRole", {
      oidcProviderArn,
      subjectArray: props.diffSubjects,
      resourcesArray: [
        `arn:aws:iam::${this.account}:role/cdk-*-lookup-role-*`,
        `arn:aws:iam::${this.account}:role/cdk-*-file-publishing-role-*`,
        `arn:aws:iam::${this.account}:role/cdk-*-image-publishing-role-*`,
      ],
      roleName: "DiffOidcCdkRole",
      envName: props.envName,
    });

    CreateIamRole(this, "DeployOidcCdkRole", {
      oidcProviderArn,
      subjectArray: props.deploySubjects,
      resourcesArray: [`arn:aws:iam::${this.account}:role/cdk-*`],
      roleName: "DeployOidcCdkRole",
      envName: props.envName,
    });
  }
}
