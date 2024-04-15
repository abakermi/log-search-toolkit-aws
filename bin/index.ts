#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LogSearchToolkitAwsStack } from '../lib/stack';

// Initialize the CDK application
const app = new cdk.App();

new LogSearchToolkitAwsStack(app, 'LogSearchToolkitAwsStack', {
  env: { 
    account: process.env.CDK_DEPLOY_ACCOUNT, 
    region: process.env.CDK_DEPLOY_REGION 
  },
  // Description of the stack
  description: "Log Search Toolkit AWS Stack"
});