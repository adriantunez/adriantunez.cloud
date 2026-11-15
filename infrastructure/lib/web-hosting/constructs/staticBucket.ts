import { Duration, RemovalPolicy } from "aws-cdk-lib";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface StaticBucketProps {
  previewPrefix: string;
  previewExpirationDays: number;
}

export class StaticBucket extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props: StaticBucketProps) {
    super(scope, id);

    this.bucket = new Bucket(this, "Bucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: false, // Bucket contents can be easily recreated from GitHub
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      lifecycleRules: [
        {
          id: "ExpirePreviews",
          prefix: `${props.previewPrefix}/`,
          expiration: Duration.days(props.previewExpirationDays),
        },
      ],
    });
  }
}
