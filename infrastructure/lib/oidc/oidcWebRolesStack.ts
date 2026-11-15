import { Stack, StackProps } from "aws-cdk-lib";
import { PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import type { SsmConfig } from "../../config/config";
import { CreateIamRole } from "./constructs/createIamRole";

interface OidcWebRolesStackProps extends StackProps {
  envName: string;
  ssm: SsmConfig;
  previewPrefix: string;
  deploySubjects: string[];
  previewSubjects: string[];
}

export class OidcWebRolesStack extends Stack {
  constructor(scope: Construct, id: string, props: OidcWebRolesStackProps) {
    super(scope, id, props);

    const oidcProviderArn = StringParameter.fromStringParameterName(
      this,
      "OidcProviderArn",
      props.ssm.providerArn,
    ).stringValue;
    const spBucketName = StringParameter.fromStringParameterName(
      this,
      "ImportedBucketName",
      props.ssm.bucketName,
    );
    const spDistributionId = StringParameter.fromStringParameterName(
      this,
      "ImportedDistributionId",
      props.ssm.distributionId,
    );
    const webBucket = Bucket.fromBucketName(
      this,
      "ImportedBucket",
      spBucketName.stringValue,
    );

    const grantCommon = (role: Role) => {
      spBucketName.grantRead(role);
      spDistributionId.grantRead(role);
      role.addToPolicy(
        new PolicyStatement({
          actions: ["cloudfront:CreateInvalidation"],
          resources: [
            `arn:aws:cloudfront::${this.account}:distribution/${spDistributionId.stringValue}`,
          ],
        }),
      );
    };

    const deployRole = CreateIamRole(this, "DeployOidcWebRole", {
      oidcProviderArn,
      subjectArray: props.deploySubjects,
      roleName: "DeployOidcWebRole",
      envName: props.envName,
    });
    webBucket.grantReadWrite(deployRole);
    grantCommon(deployRole);

    const previewRole = CreateIamRole(this, "PreviewOidcWebRole", {
      oidcProviderArn,
      subjectArray: props.previewSubjects,
      roleName: "PreviewOidcWebRole",
      envName: props.envName,
    });
    webBucket.grantReadWrite(previewRole, `${props.previewPrefix}/*`);
    grantCommon(previewRole);
  }
}
