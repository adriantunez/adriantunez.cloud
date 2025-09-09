import { RemovalPolicy } from "aws-cdk-lib";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  BucketProps,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class StaticBucket extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const bucketProps: BucketProps = {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: false, // Bucket contents can be easily recreated from GitHub
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    };

    this.bucket = new Bucket(this, "Bucket", bucketProps);
  }
}
