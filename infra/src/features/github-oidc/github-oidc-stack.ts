import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';


interface GithubStackProps extends cdk.StackProps {
  appName: string;
}

export class GithubStack extends cdk.Stack {
  githubDomain = 'token.actions.githubusercontent.com';
  clientId = 'sts.amazonaws.com';

  constructor(scope: Construct, id: string, props: GithubStackProps) {
    super(scope, id, props);

    const githubProvider = this._githubOidcProvider({
      appName: props.appName,
      providerUrl: `https://${this.githubDomain}`,
      clientIds: [this.clientId],
    });


    // CONDITIONS
    const allowedRepositories = [
      // Update format to match GitHub's expected format
      'repo:sergiopichardo/Cloud-Deployment-Challenge:*'
    ]

    const conditions: iam.Conditions = {
      StringEquals: {
        [`${this.githubDomain}:aud`]: this.clientId,
      },
      StringLike: {
        [`${this.githubDomain}:sub`]: allowedRepositories,
      },
    };

    const githubActionsRole = new iam.Role(this, 'GitHubActionsRole', {
      roleName: `${props.appName}GitHubActionsRole`,
      assumedBy: new iam.WebIdentityPrincipal(
        githubProvider.openIdConnectProviderArn,
        conditions,
      ),
      // maxSessionDuration: cdk.Duration.hours(1),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
      ],
    });

    new cdk.CfnOutput(this, 'gitHubActionsRoleArn', {
      value: githubActionsRole.roleArn,
      exportName: `gitHubActionsRoleArn`,
    });
  }

  /**
   * Creates an OpenIdConnectProvider for GitHub OIDC
   * @param props 
   *  - appName: the name of the app
   *  - providerUrl: where github generates and stores its OIDC tokens
   *  - clientIds: the client IDs that are allowed to use the tokens, in this case, it's STS used for IAM authentication
   * @returns iam.OpenIdConnectProvider
   */
  private _githubOidcProvider(props: {
    appName: string;
    providerUrl: string;
    clientIds: string[];
  }): iam.OpenIdConnectProvider {

    return new iam.OpenIdConnectProvider(this, `${props.appName}GithubOidcProvider`, {
      url: props.providerUrl,
      clientIds: props.clientIds,
    });
  }
}
