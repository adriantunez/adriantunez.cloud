import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

// Load env variables from .env if present (easier for development)
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  config({ path: envPath });
}

import type { ResourceEnvironment } from "aws-cdk-lib";

export enum Environment {
  PROD = "prod",
}

export type GlobalTags = {
  [key: string]: string;
};

export type OidcSubjects = {
  diff?: string[];
  deploy: string[];
};

export type SsmStringParameterNames = {
  bucketName: string;
  distributionId: string;
};

export type WebHosting = {
  mainDomainName: string;
  domainNames: string[];
  certificateId: string;
  hostedZoneName: string;
  ssmStringParameterNames: SsmStringParameterNames;
};

export type EnvironmentConfig = {
  currEnv: Environment;
  awsConfig: ResourceEnvironment;
  oidcSubjectsCdk: OidcSubjects;
  oidcSubjectsWeb: OidcSubjects;
  webHosting: WebHosting;
};

export type Config = Record<Environment, EnvironmentConfig>;

export const globalTags: GlobalTags = {
  RepositoryPath:
    process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`
      : "localhost",
  Project:
    process.env.GITHUB_REPOSITORY?.split("/").pop() || "adriantunez.cloud",
};

export const envConfig: Config = {
  [Environment.PROD]: {
    currEnv: Environment.PROD,
    awsConfig: {
      region: "eu-west-1",
      account: process.env.AWS_ACCOUNT_ID || "", // Fail if not defined in code
    },
    oidcSubjectsCdk: {
      diff: [`repo:${process.env.GITHUB_REPOSITORY}:*`],
      deploy: [
        `repo:${process.env.GITHUB_REPOSITORY}:environment:prod-infrastructure`,
      ],
    },
    oidcSubjectsWeb: {
      deploy: [`repo:${process.env.GITHUB_REPOSITORY}:environment:prod-web`],
    },
    webHosting: {
      mainDomainName: process.env.WEB_MAIN_DOMAIN_NAME || "", // Fail if not defined in code
      domainNames: process.env.WEB_DOMAIN_NAMES?.split(",") || [],
      certificateId: process.env.AWS_ACM_CERTIFICATE_ID || "", // Fail if not defined in code
      hostedZoneName: "adriantunez.cloud",
      ssmStringParameterNames: {
        bucketName: process.env.WEB_SSM_SP_BUCKET_NAME || "", // Fail if not defined in code
        distributionId: process.env.WEB_SSM_SP_DISTRIBUTION_ID || "", // Fail if not defined in code
      },
    },
  },
};
