import { Duration, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebHosting, type Environment, type GlobalTags } from '../config/environments';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { AllowedMethods, CachePolicy, Distribution, HeadersFrameOption, HeadersReferrerPolicy, PriceClass, ResponseHeadersPolicy, ViewerProtocolPolicy, Function as CloudFrontFunction, FunctionCode, FunctionEventType, FunctionRuntime, } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import path = require('path');
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { readFileSync } from 'fs';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';

interface WebHostingStackProps extends StackProps {
  currEnv: Environment;
  globalTags: GlobalTags;
  webHosting: WebHosting;
};

export class WebHostingStack extends Stack {

  public readonly bucketName: string;
  public readonly cfnDistributionId: string;

  constructor(scope: Construct, id: string, props: WebHostingStackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'Bucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: false, // Bucket contents can be easily recreated from GitHub
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false
    });

    this.bucketName = bucket.bucketName;

    // Custom Cache Policy
    const cachePolicy = new CachePolicy(this, "CustomCachePolicy", {
      cachePolicyName: "CachePolicyOptimized",
      defaultTtl: Duration.days(365),
      maxTtl: Duration.days(365),
      minTtl: Duration.seconds(0),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // Custom Response Headers Policy
    const responseHeadersPolicy = new ResponseHeadersPolicy(this, "CustomResponseHeadersPolicy", {
      responseHeadersPolicyName: "SecurityResponseHeadersPolicy",
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
        contentTypeOptions: {
          override: true,
        },
        referrerPolicy: {
          referrerPolicy: HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
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
            value: "max-age=43200, public",
            override: true,
          },
        ],
      },
      removeHeaders: [
        "Server"
      ],
  });

    const webRedirectFunction = new CloudFrontFunction(this, "WebRedirectFn", {
      functionName: "webredirect",
      runtime: FunctionRuntime.JS_2_0,
      // Trick to enforce CDK to compare strings and avoid redeploying if nothing changed
      code: FunctionCode.fromInline(readFileSync(path.join(__dirname, "../functions/cf-webredirect.js"), "utf8")),
    });

    // TODO: Create certificate from another CDK stack (in us-east-1)
    // Get certificate created in us-east-1 via clickops
    const cert = Certificate.fromCertificateArn(this, "ImportedCert", 
      `arn:aws:acm:us-east-1:${props.env?.account}:certificate/${props.webHosting.certificateId}`,
    );

    const dist = new Distribution(this, 'Cdn', {
      priceClass: PriceClass.PRICE_CLASS_100,
      domainNames: props.webHosting.domainNames,
      certificate: cert,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
        compress: true,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cachePolicy,
        responseHeadersPolicy: responseHeadersPolicy,
        functionAssociations: [
          {
            function: webRedirectFunction,
            eventType: FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      errorResponses: [
        {
          httpStatus: 403,
          ttl: Duration.hours(1),
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
        },
        {
          httpStatus: 404,
          ttl: Duration.hours(1),
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
        },
      ],
    });

    this.cfnDistributionId = dist.distributionId;

    // Route53 in IaC can be slightly sensitive (just import it)
    const zone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: props.webHosting.hostedZoneName,
    });

    // Create an alias record for each domainName
    props.webHosting.domainNames.forEach((subdomain, index) => {
      new ARecord(this, `AliasRecord${index}`, {
        zone,
        recordName: subdomain,
        target: RecordTarget.fromAlias(new CloudFrontTarget(dist)),
      });
    });

    // Export BucketName into SSM Parameter Store
    new StringParameter(this, "WebS3BucketNameParam", {
      parameterName: `/web/${props.currEnv}/bucketName`,
      stringValue: bucket.bucketName,
    });

    // Export CloudFront distributionId into SSM Parameter Store
    new StringParameter(this, "WebCdnDistributionIdParam", {
      parameterName: `/web/${props.currEnv}/distributionId`,
      stringValue: dist.distributionId,
    });

    // Tag all resources created by the construct (using globalTags)
    Object.entries(props.globalTags).forEach(([key, value]) => {
      Tags.of(this).add(key, value);
    });
  };
};