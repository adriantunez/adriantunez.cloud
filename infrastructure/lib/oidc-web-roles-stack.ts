import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { OidcSubjects, type Environment, type GlobalTags } from '../config/environments';
import { createIamRole } from '../config/utils';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

interface OidcWebRolesStackProps extends StackProps {
  currEnv: Environment;
  globalTags: GlobalTags;
  oidcProviderArn: string;
  oidcSubjects: OidcSubjects;
  bucketName: string;
  distributionId: string;
};

export class OidcWebRolesStack extends Stack {
  constructor(scope: Construct, id: string, props: OidcWebRolesStackProps) {
    super(scope, id, props);

    // Create Oidc role for web deploy, if defined
    if (props.oidcSubjects.deploy) {
      const role = createIamRole(this, 'DeployOidcWebRole', {
        oidcProviderArn: props.oidcProviderArn,
        subjectArray: props.oidcSubjects.deploy,
        resourcesArray: [], // no AssumeRole needed anymore
        roleName: 'DeployOidcWebRole',
        envName: props.currEnv,
      });

      role.addToPolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [
          `arn:aws:s3:::${props.bucketName}`, 
          `arn:aws:s3:::${props.bucketName}/*`,
        ],
        actions: ['s3:*'],
      }));

      // CloudFront invalidation permissions
      role.addToPolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [`arn:aws:cloudfront::${props.env?.account}:distribution/${props.distributionId}`],
        actions: ['cloudfront:CreateInvalidation'],
      }));

      // TODO: Fixme with a simpler approach:
      // webBucketParam.grantRead(role);
      // distIdParam.grantRead(role);

      // Add SSM Parameter Store read permissions
      role.addToPolicy(new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'ssm:GetParameter',
            'ssm:GetParameters',
            'ssm:GetParametersByPath',
            'ssm:DescribeParameters'
          ],
          resources: ["*"],
        })
      );
    }

    // Tag all resources created by the construct (using globalTags)
    Object.entries(props.globalTags).forEach(([key, value]) => {
      Tags.of(this).add(key, value);
    });
  };
};