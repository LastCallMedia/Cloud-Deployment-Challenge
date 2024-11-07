import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class WebsiteStack extends cdk.Stack {
  public readonly s3OriginBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.s3OriginBucket = this._createS3OriginBucket();
  }

  private _createS3OriginBucket() {
    const bucket = new s3.Bucket(this, 'WebsiteBucket', {
      publicReadAccess: false,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    return bucket;
  }
}


