import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { config } from "../config/config";
import { OIDCProviderStack } from "../lib/oidc/oidcProviderStack";
import { OidcCdkRolesStack } from "../lib/oidc/oidcCdkRolesStack";
import { OidcWebRolesStack } from "../lib/oidc/oidcWebRolesStack";
import { CertificateStack } from "../lib/certificate/certificateStack";
import { WebHostingStack } from "../lib/web-hosting/webHostingStack";
import { renderFunctionCode } from "../lib/web-hosting/constructs/edgeCfFunction";

const account = "123456789012";
const env = { account, region: config.region };

function buildApp() {
  const app = new App();
  const providerStack = new OIDCProviderStack(app, "OIDCProviderStack", {
    env,
    ssmProviderArn: config.ssm.providerArn,
  });
  const cdkRoles = new OidcCdkRolesStack(app, "OidcCdkRolesStack-prod", {
    env,
    envName: config.environment,
    ssmProviderArn: config.ssm.providerArn,
    diffSubjects: config.oidcSubjects.cdkDiff,
    deploySubjects: config.oidcSubjects.cdkDeploy,
  });
  const certificate = new CertificateStack(app, "CertificateStack-prod", {
    env: { account, region: "us-east-1" },
    crossRegionReferences: true,
    web: config.web,
  });
  const hosting = new WebHostingStack(app, "WebHostingStack-prod", {
    env,
    crossRegionReferences: true,
    certificate: certificate.certificate,
    web: config.web,
    ssm: config.ssm,
  });
  const webRoles = new OidcWebRolesStack(app, "OidcWebRolesStack-prod", {
    env,
    envName: config.environment,
    ssm: config.ssm,
    previewPrefix: config.web.previewPrefix,
    deploySubjects: config.oidcSubjects.webDeploy,
    previewSubjects: config.oidcSubjects.webPreview,
  });
  return { providerStack, cdkRoles, certificate, hosting, webRoles };
}

describe("stacks", () => {
  const stacks = buildApp();

  test("all stacks synthesize", () => {
    Object.values(stacks).forEach((stack) =>
      expect(Template.fromStack(stack)).toBeDefined(),
    );
  });

  test("certificate covers main domains and preview wildcard", () => {
    Template.fromStack(stacks.certificate).hasResourceProperties(
      "AWS::CertificateManager::Certificate",
      {
        DomainName: "adriantunez.cloud",
        SubjectAlternativeNames: [
          "www.adriantunez.cloud",
          "*.preview.adriantunez.cloud",
        ],
      },
    );
  });

  test("bucket is private and expires previews", () => {
    Template.fromStack(stacks.hosting).hasResourceProperties(
      "AWS::S3::Bucket",
      {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
        LifecycleConfiguration: {
          Rules: [
            Match.objectLike({
              Prefix: "previews/",
              ExpirationInDays: 30,
              Status: "Enabled",
            }),
          ],
        },
      },
    );
  });

  test("distribution serves main domains and preview wildcard over HTTPS", () => {
    Template.fromStack(stacks.hosting).hasResourceProperties(
      "AWS::CloudFront::Distribution",
      {
        DistributionConfig: Match.objectLike({
          Aliases: [
            "adriantunez.cloud",
            "www.adriantunez.cloud",
            "*.preview.adriantunez.cloud",
          ],
          DefaultCacheBehavior: Match.objectLike({
            ViewerProtocolPolicy: "redirect-to-https",
          }),
          WebACLId: config.web.pricingPlanWebAclArn,
        }),
      },
    );
    const records = Template.fromStack(stacks.hosting).findResources(
      "AWS::Route53::RecordSet",
    );
    const types = Object.values(records).map((r) => r.Properties.Type).sort();
    expect(types).toEqual(["A", "A", "A", "AAAA", "AAAA", "AAAA"]);
  });

  test("cdk diff role only trusts pull requests", () => {
    Template.fromStack(stacks.cdkRoles).hasResourceProperties("AWS::IAM::Role", {
      RoleName: "DiffOidcCdkRole-prod",
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: [
          Match.objectLike({
            Condition: Match.objectLike({
              StringLike: {
                "token.actions.githubusercontent.com:sub": [
                  "repo:adriantunez/adriantunez.cloud:pull_request",
                ],
              },
            }),
          }),
        ],
      }),
    });
  });

  test("preview role trusts pull requests and only writes under previews/", () => {
    const template = Template.fromStack(stacks.webRoles);
    template.hasResourceProperties("AWS::IAM::Role", {
      RoleName: "PreviewOidcWebRole-prod",
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: [
          Match.objectLike({
            Condition: Match.objectLike({
              StringLike: {
                "token.actions.githubusercontent.com:sub":
                  config.oidcSubjects.webPreview,
              },
            }),
          }),
        ],
      }),
    });

    const policies = template.findResources("AWS::IAM::Policy", {
      Properties: {
        Roles: [{ Ref: Match.stringLikeRegexp("^PreviewOidcWebRole") }],
      },
    });
    const statements = Object.values(policies).flatMap(
      (p: any) => p.Properties.PolicyDocument.Statement,
    );
    const writes = statements.filter((s: any) =>
      [s.Action]
        .flat()
        .some(
          (a: string) => a.startsWith("s3:Put") || a.startsWith("s3:Delete"),
        ),
    );
    expect(writes.length).toBeGreaterThan(0);
    writes.forEach((s: any) =>
      expect(JSON.stringify(s.Resource)).toContain("/previews/*"),
    );
  });
});

describe("edge function", () => {
  const code = renderFunctionCode({
    functionRelPath: "functions/cf-webredirect.js",
    replacements: {
      MAIN_DOMAIN: config.web.mainDomainName,
      PREVIEW_DOMAIN: config.web.previewDomainName,
      PREVIEW_PREFIX: config.web.previewPrefix,
    },
  });
  const handler = new Function(`${code}; return handler;`)();
  const run = (host: string, uri: string) =>
    handler({ request: { uri, headers: { host: { value: host } } } });

  test.each([
    ["adriantunez.cloud", "/", "/index.html"],
    ["adriantunez.cloud", "/posts/", "/posts/index.html"],
    ["adriantunez.cloud", "/css/main.css", "/css/main.css"],
    ["pr42.preview.adriantunez.cloud", "/", "/previews/pr42/index.html"],
    [
      "pr42.preview.adriantunez.cloud",
      "/img/a.png",
      "/previews/pr42/img/a.png",
    ],
  ])("%s%s is served from %s", (host, uri, expected) => {
    expect(run(host, uri).uri).toBe(expected);
  });

  test.each([
    ["www.adriantunez.cloud", "/posts/", "https://adriantunez.cloud/posts/"],
    ["evil.preview.adriantunez.cloud", "/", "https://adriantunez.cloud/"],
    ["adriantunez.cloud", "/posts", "https://adriantunez.cloud/posts/"],
    [
      "adriantunez.cloud",
      "/posts/index.html",
      "https://adriantunez.cloud/posts/",
    ],
    [
      "pr42.preview.adriantunez.cloud",
      "/about",
      "https://pr42.preview.adriantunez.cloud/about/",
    ],
  ])("%s%s redirects to %s", (host, uri, location) => {
    const response = run(host, uri);
    expect(response.statusCode).toBe(301);
    expect(response.headers.location.value).toBe(location);
  });

  test.each([
    "/previews",
    "/previews/",
    "/previews/pr42/",
    "/previews/pr42/index.html",
  ])("adriantunez.cloud%s does not serve previews", (uri) => {
    const response = run("adriantunez.cloud", uri);
    expect(response.statusCode).toBeUndefined();
    expect(response.uri).toBe("/404-not-found");
  });

  test("adriantunez.cloud/previews-guide/ is still served normally", () => {
    expect(run("adriantunez.cloud", "/previews-guide/").uri).toBe(
      "/previews-guide/index.html",
    );
  });
});
