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
  mainDomainName: string;
}

export class EdgeCfFunction extends Construct {
  public readonly cfFunction: CloudFrontFunction;

  constructor(scope: Construct, id: string, props: EdgeCfFunctionProps) {
    super(scope, id);

    const cfFunctionPlaceholder = readFileSync(
      path.join(process.cwd(), props.functionRelPath),
      "utf8"
    );
    const cfFunctionCode = cfFunctionPlaceholder.replace(
      "%%DESIRED_DOMAIN%%",
      props.mainDomainName
    );

    this.cfFunction = new CloudFrontFunction(this, "WebRedirectFn", {
      runtime: FunctionRuntime.JS_2_0,
      code: FunctionCode.fromInline(cfFunctionCode),
    });
  }
}
