import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { SsmStringParameterNamesWebHosting } from "../../../config/environments";

export interface SsmWebHostingOutputsProps {
  ssmStringParameterNamesWebHosting: SsmStringParameterNamesWebHosting;
  bucketName: string;
  distributionId: string;
}

export class SsmWebHostingOutputs extends Construct {
  constructor(scope: Construct, id: string, props: SsmWebHostingOutputsProps) {
    super(scope, id);

    new StringParameter(this, "BucketNameParam", {
      parameterName: props.ssmStringParameterNamesWebHosting.bucketName,
      stringValue: props.bucketName,
    });

    new StringParameter(this, "DistributionIdParam", {
      parameterName: props.ssmStringParameterNamesWebHosting.distributionId,
      stringValue: props.distributionId,
    });
  }
}
