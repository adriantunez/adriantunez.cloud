import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export interface SsmWebHostingOutputsProps {
  bucketNameParam: string;
  distributionIdParam: string;
  bucketName: string;
  distributionId: string;
}

// Publishes bucket name and distribution ID for the deploy workflows
export class SsmWebHostingOutputs extends Construct {
  constructor(scope: Construct, id: string, props: SsmWebHostingOutputsProps) {
    super(scope, id);

    new StringParameter(this, "BucketNameParam", {
      parameterName: props.bucketNameParam,
      stringValue: props.bucketName,
    });

    new StringParameter(this, "DistributionIdParam", {
      parameterName: props.distributionIdParam,
      stringValue: props.distributionId,
    });
  }
}
