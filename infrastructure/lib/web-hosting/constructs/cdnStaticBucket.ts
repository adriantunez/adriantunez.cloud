import { Bucket } from "aws-cdk-lib/aws-s3";
import {
  AllowedMethods,
  CachePolicy,
  Function as CloudFrontFunction,
  Distribution,
  FunctionEventType,
  HeadersFrameOption,
  HeadersReferrerPolicy,
  HttpVersion,
  PriceClass,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { Construct } from "constructs";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Duration } from "aws-cdk-lib";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";

export interface cdnStaticBucketProps {
  bucket: Bucket;
  certificateArn: string;
  domainNames: string[];
  viewerRequestFn: CloudFrontFunction;
}

export class cdnStaticBucket extends Construct {
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: cdnStaticBucketProps) {
    super(scope, id);

    // Certificate is shared between several apps. Get it here
    const cert = Certificate.fromCertificateArn(
      this,
      "ImportedCert",
      props.certificateArn,
    );

    // Security headers
    const responseHeadersPolicy = new ResponseHeadersPolicy(
      this,
      "SecurityResponseHeadersPolicy",
      {
        securityHeadersBehavior: {
          strictTransportSecurity: {
            accessControlMaxAge: Duration.days(365),
            includeSubdomains: true,
            preload: true,
            override: true,
          },
          xssProtection: {
            protection: true,
            modeBlock: true,
            override: true,
          },
          frameOptions: {
            frameOption: HeadersFrameOption.DENY,
            override: true,
          },
          contentTypeOptions: { override: true },
          referrerPolicy: {
            referrerPolicy:
              HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
            override: true,
          },
          contentSecurityPolicy: {
            contentSecurityPolicy: "frame-ancestors 'none';",
            override: true,
          },
        },
        customHeadersBehavior: {
          customHeaders: [
            {
              header: "Cache-Control",
              value: `max-age=${Duration.hours(12).toSeconds()}, public`,
              override: true,
            },
          ],
        },
        removeHeaders: ["Server"],
      },
    );

    this.distribution = new Distribution(this, "Distribution", {
      priceClass: PriceClass.PRICE_CLASS_100,
      domainNames: props.domainNames,
      certificate: cert,
      httpVersion: HttpVersion.HTTP2_AND_3,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(props.bucket),
        compress: true,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: responseHeadersPolicy,
        functionAssociations: [
          {
            function: props.viewerRequestFn,
            eventType: FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      errorResponses: [
        {
          httpStatus: 403,
          ttl: Duration.hours(1),
          responseHttpStatus: 404,
          responsePagePath: "/404.html",
        },
        {
          httpStatus: 404,
          ttl: Duration.hours(1),
          responseHttpStatus: 404,
          responsePagePath: "/404.html",
        },
      ],
    });
  }
}
