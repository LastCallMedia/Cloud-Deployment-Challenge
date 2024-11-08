#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebsiteStack } from './features/website-hosting/website-stack';
import path = require('path');
import { GithubStack } from './features/github-oidc/github-oidc-stack';

const appName = process.env.APP_NAME || 'LCM-Challenge'

const app = new cdk.App();
const websiteStack = new WebsiteStack(app, `${appName}WebsiteStack`, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  appName,
  cloudFrontFunctionPath: path.join(__dirname, 'features', 'website-hosting', 'auth.js'),
  websitePath: path.join(__dirname, '..', '..', 'web'),
});

new GithubStack(app, `${appName}GithubStack`, {
  appName,
  distribution: websiteStack.distribution,
  websiteBucket: websiteStack.websiteBucket,
  allowedRepositories: ['repo:sergiopichardo/Cloud-Deployment-Challenge:*'],
});
