import * as cdk from 'aws-cdk-lib';
import * as stackset from 'cdk-stacksets'
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import {Construct} from 'constructs';

interface AwsCdkDeployStackProps extends cdk.StackProps {
    orgId: string;
    rootOu: string
}

export class AwsCdkDeployStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: AwsCdkDeployStackProps) {
        super(scope, id, props);

        const managementAccount = this.account

        const bucket = new s3.Bucket(this, "Assets", {});

        bucket.addToResourcePolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ["s3:Get*", "s3:List*"],
                resources: [bucket.arnForObjects("*"), bucket.bucketArn],
                principals: [new iam.OrganizationPrincipal(props.orgId)],
            })
        );

        const deployment = new s3deploy.BucketDeployment(this, 'DeployAssets', {
            sources: [s3deploy.Source.asset('./assets')],
            destinationBucket: bucket,
            extract: true
        })

        new cdk.CfnOutput(this, 'BucketName', {
            value: bucket.bucketName,
        })

        const ss = new stackset.StackSet(this, 'StackSet', {
            stackSetName: 'CdkDeployStackSet',
            template: {
                templateUrl: bucket.urlForObject('cdk-bootstrap.template.yml'),
            },
            capabilities: [stackset.Capability.NAMED_IAM],
            deploymentType: stackset.DeploymentType.serviceManaged({
                autoDeployEnabled: true,
                delegatedAdmin: true,
                autoDeployRetainStacks: true
            }),
            managedExecution: true,
            target: stackset.StackSetTarget.fromOrganizationalUnits({
                organizationalUnits: [props.rootOu],
                regions: ['us-west-2'],
                parameterOverrides: {
                    'TrustedAccounts': managementAccount,
                    'TrustedAccountsForLookup': managementAccount,
                    'CloudFormationExecutionPolicies': 'arn:aws:iam::aws:policy/AdministratorAccess'
                },
            }),
            operationPreferences: {
                maxConcurrentCount: 5,
                regionConcurrencyType: stackset.RegionConcurrencyType.PARALLEL,
                failureToleranceCount: 5,
                failureTolerancePercentage: 100
            },
            description: 'This stack includes resources needed to deploy AWS CDK apps into this environment',
        });

        ss.node.addDependency(deployment)
    }
}
