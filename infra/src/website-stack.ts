import * as path from 'path';

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';

export class WebsiteStack extends cdk.Stack {
  public readonly originBucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const authCloudFrontFunction = this._createAuthCloudFrontFunction({
      filePath: path.join(__dirname, '../functions/auth.js'),
    });

    this.originBucket = this._createS3OriginBucket();

    this.distribution = this._createCloudFrontDistribution({
      bucket: this.originBucket,
      authFunction: authCloudFrontFunction,
    });

    this._websiteDeployment({
      bucket: this.originBucket,
      distribution: this.distribution,
      siteSourcePath: path.join(__dirname, '..', '..', 'web'),
    });

    new cdk.CfnOutput(this, 'distributionUrl', {
      value: `https://${this.distribution.domainName}`,
      exportName: 'distributionUrl',
    });
  }

  private _createAuthCloudFrontFunction(props: {
    filePath: string;
  }): cloudfront.Function {
    return new cloudfront.Function(this, 'AuthFunction', {
      code: cloudfront.FunctionCode.fromFile({
        filePath: props.filePath,
      }),
    });
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

  private _createCloudFrontDistribution(props: {
    bucket: s3.Bucket;
    authFunction: cloudfront.Function;
  }): cloudfront.Distribution {
    return new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: cloudfrontOrigins.S3BucketOrigin.withOriginAccessControl(props.bucket),
        functionAssociations: [{
          function: props.authFunction,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST
        }],
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
    });
  }

  private _websiteDeployment(props: {
    bucket: s3.Bucket;
    distribution: cloudfront.Distribution;
    siteSourcePath: string;
  }) {

    return new s3Deployment.BucketDeployment(this, "StaticWebsiteDeployment", {
      sources: [s3Deployment.Source.asset(props.siteSourcePath)],
      distribution: props.distribution,
      distributionPaths: ["/*"], // The file paths to invalidate in the CloudFront distribution cache.
      destinationBucket: props.bucket,
      retainOnDelete: false,
    });
  }
}


