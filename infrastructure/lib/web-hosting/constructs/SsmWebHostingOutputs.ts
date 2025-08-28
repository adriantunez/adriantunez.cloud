import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { SsmStringParameterNames } from "../../../config/environments";

export interface SsmWebHostingOutputsProps {
  stringParameterNames: SsmStringParameterNames;
  bucketName: string;
  distributionId: string;
}

export class SsmWebHostingOutputs extends Construct {
  constructor(scope: Construct, id: string, props: SsmWebHostingOutputsProps) {
    super(scope, id);

    new StringParameter(this, "BucketNameParam", {
      parameterName: props.stringParameterNames.bucketName,
      stringValue: props.bucketName,
    });

    new StringParameter(this, "DistributionIdParam", {
      parameterName: props.stringParameterNames.distributionId,
      stringValue: props.distributionId,
    });
  }
}
