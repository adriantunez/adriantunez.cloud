import { config } from "dotenv";
import { resolve } from "path";
import type { ResourceEnvironment } from "aws-cdk-lib";

// Load env variables if .env files are present (it's easier for development/testing)
config({
  path: [
    resolve(process.cwd(), ".env.dev"),
    resolve(process.cwd(), ".env.test"),
  ],
});

export enum Environment {
  PROD = "prod",
  STAG = "stag",
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

function checkEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const globalTags: GlobalTags = {
  RepositoryPath: `${checkEnvVar("GITHUB_SERVER_URL")}/${checkEnvVar("GITHUB_REPOSITORY")}`,
  Project: checkEnvVar("GITHUB_REPOSITORY").split("/").pop()!,
};

const sharedConfig = {
  awsConfig: {
    region: "eu-west-1",
    account: checkEnvVar("AWS_ACCOUNT_ID"),
  },
  oidcSubjectsCdk: {
    diff: [`repo:${checkEnvVar("GITHUB_REPOSITORY")}:*`],
  },
  webHosting: {
    mainDomainName: checkEnvVar("WEB_MAIN_DOMAIN_NAME"),
    domainNames: checkEnvVar("WEB_DOMAIN_NAMES").split(","),
    certificateId: checkEnvVar("AWS_ACM_CERTIFICATE_ID"),
    hostedZoneName: "adriantunez.cloud",
    ssmStringParameterNames: {
      bucketName: checkEnvVar("WEB_SSM_SP_BUCKET_NAME"),
      distributionId: checkEnvVar("WEB_SSM_SP_DISTRIBUTION_ID"),
    },
  },
};

export const envConfig: Config = {
  [Environment.PROD]: {
    ...sharedConfig,
    currEnv: Environment.PROD,
    oidcSubjectsCdk: {
      ...sharedConfig.oidcSubjectsCdk,
      deploy: [
        `repo:${checkEnvVar("GITHUB_REPOSITORY")}:environment:prod-infrastructure`,
      ],
    },
    oidcSubjectsWeb: {
      deploy: [`repo:${checkEnvVar("GITHUB_REPOSITORY")}:environment:prod-web`],
    },
  },
  [Environment.STAG]: {
    ...sharedConfig,
    currEnv: Environment.STAG,
    oidcSubjectsCdk: {
      ...sharedConfig.oidcSubjectsCdk,
      deploy: [
        `repo:${checkEnvVar("GITHUB_REPOSITORY")}:environment:stag-infrastructure`,
      ],
    },
    oidcSubjectsWeb: {
      deploy: [`repo:${checkEnvVar("GITHUB_REPOSITORY")}:environment:stag-web`],
    },
  },
};
