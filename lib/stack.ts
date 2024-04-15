import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { S3Storage } from './resources/s3_storage';
import { Processors } from './resources/processors';

export class LogSearchToolkitAwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const storage = new S3Storage(this, 'S3Storage');
    const processors = new Processors(this, 'Processors', {
      indexedLogBucket: storage.indexedLogBucket,
      rawLogBucket: storage.rawLogBucket,
    });

    new cdk.CfnOutput(this, 'RawLogBucket', {
      value: storage.rawLogBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'IndexedLogBucket', {
      value: storage.indexedLogBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'IndexLogFunction', {
      value: processors.indexLog.functionName,
    });

    new cdk.CfnOutput(this, 'SearchLogFunction', {
      value: processors.searchLog.functionName,
    });



   
  }
}
