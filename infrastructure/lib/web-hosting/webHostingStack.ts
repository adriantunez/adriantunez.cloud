import { Stack, StackProps } from "aws-cdk-lib";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";
import type { SsmConfig, WebConfig } from "../../config/config";
import { StaticBucket } from "./constructs/staticBucket";
import { EdgeCfFunction } from "./constructs/edgeCfFunction";
import { DnsAliasesDistId } from "./constructs/dnsAliasesDistId";
import { cdnStaticBucket } from "./constructs/cdnStaticBucket";
import { SsmWebHostingOutputs } from "./constructs/SsmWebHostingOutputs";

interface WebHostingStackProps extends StackProps {
  certificate: ICertificate;
  web: WebConfig;
  ssm: SsmConfig;
}

export class WebHostingStack extends Stack {
  constructor(scope: Construct, id: string, props: WebHostingStackProps) {
    super(scope, id, props);

    const domainNames = [
      ...props.web.domainNames,
      `*.${props.web.previewDomainName}`,
    ];

    const staticBucket = new StaticBucket(this, "StaticBucket", {
      previewPrefix: props.web.previewPrefix,
      previewExpirationDays: props.web.previewExpirationDays,
    });

    const edgeCfFunction = new EdgeCfFunction(this, "EdgeCfFunction", {
      functionRelPath: "functions/cf-webredirect.js",
      replacements: {
        MAIN_DOMAIN: props.web.mainDomainName,
        PREVIEW_DOMAIN: props.web.previewDomainName,
        PREVIEW_PREFIX: props.web.previewPrefix,
      },
    });

    const cdn = new cdnStaticBucket(this, "Cdn", {
      bucket: staticBucket.bucket,
      certificate: props.certificate,
      domainNames,
      viewerRequestFn: edgeCfFunction.cfFunction,
    });

    new DnsAliasesDistId(this, "DnsAliasesDistId", {
      hostedZoneName: props.web.hostedZoneName,
      domainNames,
      distribution: cdn.distribution,
    });

    new SsmWebHostingOutputs(this, "SsmWebHostingOutputs", {
      bucketNameParam: props.ssm.bucketName,
      distributionIdParam: props.ssm.distributionId,
      bucketName: staticBucket.bucket.bucketName,
      distributionId: cdn.distribution.distributionId,
    });
  }
}
