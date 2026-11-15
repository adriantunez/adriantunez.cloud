import { Stack, StackProps } from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import type { WebConfig } from "../../config/config";

interface CertificateStackProps extends StackProps {
  web: WebConfig;
}

export class CertificateStack extends Stack {
  public readonly certificate: Certificate;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const zone = HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.web.hostedZoneName,
    });

    const [domainName, ...alternativeNames] = props.web.domainNames;
    this.certificate = new Certificate(this, "Certificate", {
      domainName,
      subjectAlternativeNames: [
        ...alternativeNames,
        `*.${props.web.previewDomainName}`,
      ],
      validation: CertificateValidation.fromDns(zone),
    });
  }
}
