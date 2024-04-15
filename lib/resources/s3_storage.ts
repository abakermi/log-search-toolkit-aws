import { Construct } from 'constructs';
import { RemovalPolicy} from 'aws-cdk-lib';
import * as s3 from "aws-cdk-lib/aws-s3";
import { Tags } from 'aws-cdk-lib';


export class S3Storage extends Construct {
    public readonly rawLogBucket: s3.Bucket;
    public readonly indexedLogBucket: s3.Bucket;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.rawLogBucket=new s3.Bucket(this, `app-raw-log-s3-demo`, {
            bucketName:"raw-log-s3-demo",
        });
        this.indexedLogBucket=new s3.Bucket(this, `app-indexed-log-s3-demo`, {
            bucketName:"indexd-log-s3-demo",
        });

    }}
