import { Construct } from "constructs";
import {
  Function as CloudFrontFunction,
  FunctionCode,
  FunctionRuntime,
} from "aws-cdk-lib/aws-cloudfront";
import { readFileSync } from "fs";
import path = require("path");

export interface EdgeCfFunctionProps {
  functionRelPath: string;
  // Each KEY replaces every %%KEY%% placeholder in the function code
  replacements: Record<string, string>;
}

export function renderFunctionCode(props: EdgeCfFunctionProps): string {
  let code = readFileSync(
    path.join(__dirname, "../../..", props.functionRelPath),
    "utf8",
  );
  for (const [key, value] of Object.entries(props.replacements)) {
    code = code.split(`%%${key}%%`).join(value);
  }
  const missing = code.match(/%%[A-Z_]+%%/);
  if (missing)
    throw new Error(
      `Unreplaced placeholder ${missing[0]} in ${props.functionRelPath}`,
    );
  return code;
}

export class EdgeCfFunction extends Construct {
  public readonly cfFunction: CloudFrontFunction;

  constructor(scope: Construct, id: string, props: EdgeCfFunctionProps) {
    super(scope, id);

    this.cfFunction = new CloudFrontFunction(this, "WebRedirectFn", {
      runtime: FunctionRuntime.JS_2_0,
      code: FunctionCode.fromInline(renderFunctionCode(props)),
    });
  }
}
