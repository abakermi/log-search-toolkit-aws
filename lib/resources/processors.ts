import { Construct } from 'constructs';
import {CfnOutput} from "aws-cdk-lib"
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';

import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";


interface IProcessorProps {
    indexedLogBucket: s3.Bucket;
    rawLogBucket: s3.Bucket;
}

export class Processors extends Construct {
    public readonly indexLog:lambdaNodejs.NodejsFunction;
    public readonly searchLog:lambdaNodejs.NodejsFunction;

    constructor(scope: Construct, id: string,props:IProcessorProps) {
        super(scope, id);

        const nodeJsFunctionProps: lambdaNodejs.NodejsFunctionProps = {
            bundling: {
                externalModules: [
                ],
                minify: true
            },
            depsLockFilePath: path.join(__dirname, '../func', 'package-lock.json'),
            environment: {},
            runtime: lambda.Runtime.NODEJS_18_X,
        }

         this.indexLog = new lambdaNodejs.NodejsFunction(this, `index-log-fn`, {
            handler: "handler",
            functionName: `index-log`,
            entry: path.join(__dirname, '../func', 'handler.ts'),
            memorySize: 1024,
            description: "Index log data",
            ...nodeJsFunctionProps,
            environment: {
                ...nodeJsFunctionProps.environment,
                INDEX_BUCKET_NAME: props.indexedLogBucket.bucketName
            }
        });
        this.searchLog = new lambdaNodejs.NodejsFunction(this, `search-log-fn`, {
            handler: "handler",
            functionName: `search-log`,
            entry: path.join(__dirname, '../func', 'search.ts'),
            memorySize: 1024,
            description: "Search log data",
            ...nodeJsFunctionProps,
            environment: {
                ...nodeJsFunctionProps.environment,
                INDEX_BUCKET_NAME: props.indexedLogBucket.bucketName
            }
        });
        const  fnUrl=this.searchLog.addFunctionUrl({
            authType: lambda.FunctionUrlAuthType.NONE,
            cors: {
                allowedOrigins: ['*'],
                allowedMethods: [lambda.HttpMethod.POST],
                allowedHeaders: ['Content-Type']
            }
        })
        props.indexedLogBucket.grantReadWrite(this.indexLog);
        props.rawLogBucket.grantReadWrite(this.indexLog);
        props.indexedLogBucket.grantRead(this.searchLog);
        props.rawLogBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(this.indexLog));

        new CfnOutput(this, 'SearchLogFunctionUrl', {
            value: fnUrl.url
          });

    }}
