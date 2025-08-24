import type { ResourceEnvironment } from "aws-cdk-lib";

export enum Environment {
  PROD = "prod",
};

export type GlobalTags = {
  [key: string]: string,
};

export type OidcSubjectsCdk = {
  diff: string[];
  deploy: string[];
}

export type EnvironmentConfig = {
  currEnv: Environment;
  awsConfig: ResourceEnvironment;
  oidcSubjectsCdk: OidcSubjectsCdk;
};

export type Config = Record<Environment, EnvironmentConfig>;

export const globalTags: GlobalTags = {
  RepositoryPath: process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`
    : 'localhost',
  Project: process.env.GITHUB_REPOSITORY?.split('/').pop() || 'adriantunez.cloud',
};

export const envConfig: Config = {
  [Environment.PROD]: {
    currEnv: Environment.PROD,
    awsConfig: {
      region: "eu-west-1",
      account: process.env.AWS_ACCOUNT_ID || '', // If account is not defined, force a failure
    },
    oidcSubjectsCdk: {
      diff: [
        `repo:${process.env.GITHUB_REPOSITORY}:*`,
      ],
      deploy: [
        `repo:${process.env.GITHUB_REPOSITORY}:environment:${Environment.PROD}`,
      ]
    },
  }
};