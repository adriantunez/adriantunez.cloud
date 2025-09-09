import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";

export interface DnsAliasesDistIdProps {
  hostedZoneName: string;
  domainNames: string[];
  distribution: Distribution;
}

export class DnsAliasesDistId extends Construct {
  constructor(scope: Construct, id: string, props: DnsAliasesDistIdProps) {
    super(scope, id);

    const zone = HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.hostedZoneName,
    });

    props.domainNames.forEach((recordName, i) => {
      new ARecord(this, `AliasARecord${i}`, {
        zone,
        recordName,
        target: RecordTarget.fromAlias(
          new CloudFrontTarget(props.distribution),
        ),
      });
    });
  }
}
