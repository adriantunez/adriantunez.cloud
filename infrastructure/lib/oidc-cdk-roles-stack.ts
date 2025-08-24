import { CfnOutput, Duration, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Effect, ManagedPolicy, PolicyDocument, PolicyStatement, Role, WebIdentityPrincipal, type IManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { type Environment, type GlobalTags, type OidcSubjectsCdk } from '../config/environments';

interface OidcCdkRolesStackProps extends StackProps {
  currEnv: Environment;
  globalTags: GlobalTags;
  oidcProviderArn: string;
  oidcSubjects: OidcSubjectsCdk;
};

export class OidcCdkRolesStack extends Stack {
  constructor(scope: Construct, id: string, props: OidcCdkRolesStackProps) {
    super(scope, id, props);

    // Create Oidc role for CDK diff 
    this.createIamRole(
      'DiffOidcCdkRole', 
      props.oidcProviderArn, 
      props.oidcSubjects.diff, 
      [
        `arn:aws:iam::${props.env?.account}:role/cdk-*-lookup-role-*`,
        `arn:aws:iam::${props.env?.account}:role/cdk-*-file-publishing-role-*`,
        `arn:aws:iam::${props.env?.account}:role/cdk-*-image-publishing-role-*`
      ],
      props,
    );

    // Create Oidc role for CDK deploy
    this.createIamRole(
      'DeployOidcCdkRole', 
      props.oidcProviderArn, 
      props.oidcSubjects.deploy, 
      [
        `arn:aws:iam::${props.env?.account}:role/cdk-*`,
      ],
      props,
    );

    // Tag all resources created by the construct (using globalTags)
    Object.entries(props.globalTags).forEach(([key, value]) => {
      Tags.of(this).add(key, value);
    });
  };

  // Helper function to simplify role creation
  private createIamRole(name: string, oidcProviderArn: string, subjectArray: string[], resourcesArray: string[], props: OidcCdkRolesStackProps) {
    const role = new Role(this, `${name}`, {
      assumedBy: new WebIdentityPrincipal(oidcProviderArn, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        },
        StringLike: {
          'token.actions.githubusercontent.com:sub': subjectArray,
        }
      }),
      roleName: `${name}-${props.currEnv}`,
      maxSessionDuration: Duration.hours(2),
      inlinePolicies: {
        AssumeCDKRoles: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ['sts:AssumeRole'],
              resources: resourcesArray,
            }),
          ],
        }),
      },
    });
  }
};