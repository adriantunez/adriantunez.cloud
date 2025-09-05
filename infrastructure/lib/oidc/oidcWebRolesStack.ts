import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  OidcSubjects,
  SsmStringParameterNamesWebHosting,
  type Environment,
  type GlobalTags,
} from "../../config/environments";
import { CreateIamRole } from "./constructs/createIamRole";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

interface OidcWebRolesStackProps extends StackProps {
  currEnv: Environment;
  globalTags: GlobalTags;
  ssmStringParameterProviderArn: string;
  oidcSubjects: OidcSubjects;
  ssmStringParameterNamesWebHosting: SsmStringParameterNamesWebHosting;
}

export class OidcWebRolesStack extends Stack {
  constructor(scope: Construct, id: string, props: OidcWebRolesStackProps) {
    super(scope, id, props);

    // Get Provider ARN from SSM Parameter Store
    const oidcProviderArn = StringParameter.fromStringParameterName(
      this,
      "OidcProviderArn",
      props.ssmStringParameterProviderArn
    ).stringValue;

    // Create Oidc role for web deploy, if defined
    if (props.oidcSubjects.deploy) {
      const role = CreateIamRole(this, "DeployOidcWebRole", {
        oidcProviderArn: oidcProviderArn,
        subjectArray: props.oidcSubjects.deploy,
        resourcesArray: [], // no AssumeRole needed anymore
        roleName: "DeployOidcWebRole",
        envName: props.currEnv,
      });

      // Import required resources from its SSM parameter
      const spBucketName = StringParameter.fromStringParameterName(
        this,
        "ImportedBucketName",
        props.ssmStringParameterNamesWebHosting.bucketName
      );
      const spDistributionId = StringParameter.fromStringParameterName(
        this,
        "ImportedDistributionId",
        props.ssmStringParameterNamesWebHosting.distributionId
      );

      // Grant RW access to the web bucket
      const webBucket = Bucket.fromBucketName(
        this,
        "ImportedBucket",
        spBucketName.stringValue
      );
      webBucket.grantReadWrite(role);

      // CloudFront invalidation permissions
      role.addToPolicy(
        new PolicyStatement({
          resources: [
            `arn:aws:cloudfront::${props.env?.account}:distribution/${spDistributionId.stringValue}`,
          ],
          actions: ["cloudfront:CreateInvalidation"],
        })
      );

      // Grant RO access to ssmWebHosting parameters
      spBucketName.grantRead(role);
      spDistributionId.grantRead(role);
    }

    // Tag all resources created by the construct (using globalTags)
    Object.entries(props.globalTags).forEach(([key, value]) => {
      Tags.of(this).add(key, value);
    });
  }
}
