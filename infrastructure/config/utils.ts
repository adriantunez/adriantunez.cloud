import { Duration } from "aws-cdk-lib";
import {
  Role,
  WebIdentityPrincipal,
  PolicyDocument,
  PolicyStatement,
  Effect,
} from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface CreateIamRoleProps {
  oidcProviderArn: string;
  subjectArray: string[];
  resourcesArray?: string[];
  roleName: string;
  envName: string;
}

export function createIamRole(
  scope: Construct,
  name: string,
  props: CreateIamRoleProps,
): Role {
  const role = new Role(scope, name, {
    assumedBy: new WebIdentityPrincipal(props.oidcProviderArn, {
      StringEquals: {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
      },
      StringLike: {
        "token.actions.githubusercontent.com:sub": props.subjectArray,
      },
    }),
    roleName: `${props.roleName}-${props.envName}`,
    maxSessionDuration: Duration.hours(2),
  });

  // Add the inline policy ONLY if there are resources to target
  if (props.resourcesArray && props.resourcesArray.length > 0) {
    role.addToPrincipalPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["sts:AssumeRole"],
        resources: props.resourcesArray,
      }),
    );
  }

  return role;
}
