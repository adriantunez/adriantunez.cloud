import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { OidcSubjects, type Environment, type GlobalTags } from '../config/environments';
import { createIamRole } from '../config/utils';

interface OidcCdkRolesStackProps extends StackProps {
  currEnv: Environment;
  globalTags: GlobalTags;
  oidcProviderArn: string;
  oidcSubjects: OidcSubjects;
};

export class OidcCdkRolesStack extends Stack {
  constructor(scope: Construct, id: string, props: OidcCdkRolesStackProps) {
    super(scope, id, props);

    // Create Oidc role for CDK diff, if defined
    if (props.oidcSubjects.diff) {
      createIamRole(this, "DiffOidcCdkRole", {
        oidcProviderArn: props.oidcProviderArn,
        subjectArray: props.oidcSubjects.diff,
        resourcesArray: [
          `arn:aws:iam::${props.env?.account}:role/cdk-*-lookup-role-*`,
          `arn:aws:iam::${props.env?.account}:role/cdk-*-file-publishing-role-*`,
          `arn:aws:iam::${props.env?.account}:role/cdk-*-image-publishing-role-*`,
        ],
        roleName: "DiffOidcCdkRole",
        envName: props.currEnv,
      });
    }

    // Create Oidc role for CDK deploy, if defined
    if (props.oidcSubjects.deploy) {
      createIamRole(this, "DeployOidcCdkRole", {
        oidcProviderArn: props.oidcProviderArn,
        subjectArray: props.oidcSubjects.deploy,
        resourcesArray: [
          `arn:aws:iam::${props.env?.account}:role/cdk-*`
        ],
        roleName: "DeployOidcCdkRole",
        envName: props.currEnv,
      });
    }

    // Tag all resources created by the construct (using globalTags)
    Object.entries(props.globalTags).forEach(([key, value]) => {
      Tags.of(this).add(key, value);
    });
  };

  
};