#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AwsCdkDeployStack } from '../lib/aws-cdk-deploy-stack';

const region = "us-west-2"
const orgId = "o-jjwnxctkns"
const rootOu = "r-5eyf"
const managementAccount = "114914322771"

const app = new cdk.App();
new AwsCdkDeployStack(app, 'AwsCdkDeployStack', {
    stackName: 'CdkDeployStack',
    orgId: orgId,
    rootOu: rootOu,
    env: {
        account: managementAccount,
        region: region
    }
});