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

      // Validate required web config
      if (!props.bucketName) {
        throw new Error(
          "Missing S3 bucket name for web deploy. Set AWS_S3_WEB_BUCKET or provide web.bucketName in envConfig."
        );
      }
      
      if (!props.distributionId) {
        throw new Error(
          "Missing CloudFront distribution ID for web deploy. Set AWS_CLOUDFRONT_DISTRIBUTION_ID or provide web.distributionId in envConfig."
        );
      }

      const bucketArn = `arn:aws:s3:::${props.bucketName}`;
      const bucketObjectsArn = `arn:aws:s3:::${props.bucketName}/*`;
      const cfArn = `arn:aws:cloudfront::${props.env?.account}:distribution/${props.distributionId}`;

      // Broad S3 permissions (sync with --delete)
      role.addToPolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [bucketArn, bucketObjectsArn],
        actions: ['s3:*'],
      }));

      // CloudFront invalidation permissions
      role.addToPolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [cfArn],
        actions: ['cloudfront:CreateInvalidation'], // or 'cloudfront:*' if you want broader
      }));
    }

    // Tag all resources created by the construct (using globalTags)
    Object.entries(props.globalTags).forEach(([key, value]) => {
      Tags.of(this).add(key, value);
    });
  };
};