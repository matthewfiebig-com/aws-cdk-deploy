#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsCdkDeployStack } from '../lib/aws-cdk-deploy-stack';

const region = "us-west-2"
const orgId = "o-ljx5a2fodi"
const managementAccount = "985539764435"

const app = new cdk.App();
new AwsCdkDeployStack(app, 'AwsCdkDeployStack', {
    stackName: 'CdkDeployStack',
    orgId: orgId,
    env: {
        account: managementAccount,
        region: region
    }
});