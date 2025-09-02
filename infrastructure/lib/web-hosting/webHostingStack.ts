import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  WebHosting,
  type Environment,
  type GlobalTags,
} from "../../config/environments";
import { StaticBucket } from "./constructs/staticBucket";
import { EdgeCfFunction } from "./constructs/edgeCfFunction";
import { DnsAliasesDistId } from "./constructs/dnsAliasesDistId";
import { cdnStaticBucket } from "./constructs/cdnStaticBucket";
import { SsmWebHostingOutputs } from "./constructs/SsmWebHostingOutputs";

interface WebHostingStackProps extends StackProps {
  currEnv: Environment;
  globalTags: GlobalTags;
  webHosting: WebHosting;
}

export class WebHostingStack extends Stack {
  constructor(scope: Construct, id: string, props: WebHostingStackProps) {
    super(scope, id, props);

    // Create the S3 bucket for the static site
    const staticBucket = new StaticBucket(this, "StaticBucket");

    // Create the Edge Redirect Function for CloudFront
    const edgeCfFunction = new EdgeCfFunction(this, "EdgeCfFunction", {
      functionRelPath: "functions/cf-webredirect.js",
      mainDomainName: props.webHosting.mainDomainName,
    });

    // Create CloudFront Distribution CDN with the S3 bucket as origin, custom policies, and functions
    const cdn = new cdnStaticBucket(this, "Cdn", {
      bucket: staticBucket.bucket,
      certificateArn: `arn:aws:acm:us-east-1:${props.env?.account}:certificate/${props.webHosting.certificateId}`,
      domainNames: props.webHosting.domainNames,
      viewerRequestFn: edgeCfFunction.cfFunction,
    });

    // DNS Aliases To CloudFront Distribution
    new DnsAliasesDistId(this, "DnsAliasesDistId", {
      hostedZoneName: props.webHosting.hostedZoneName,
      domainNames: props.webHosting.domainNames,
      distribution: cdn.distribution,
    });

    // Export SSM Parameter Store created values
    new SsmWebHostingOutputs(this, "SsmWebHostingOutputs", {
      stringParameterNames: props.webHosting.ssmStringParameterNames,
      bucketName: staticBucket.bucket.bucketName,
      distributionId: cdn.distribution.distributionId,
    });

    // Tag all resources created by the construct (using globalTags)
    Object.entries(props.globalTags).forEach(([key, value]) => {
      Tags.of(this).add(key, value);
    });
  }
}
