const AWS = require('aws-sdk')
const support = new AWS.Support({
  apiVersion: '2013-04-15',
  region: 'us-east-1' // AWS Support API is only accessible from the us-east-1 region
})

const utilities = {
  /*
    These checks are being removed on November 18, 2020
    See: https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html
  */
  removedChecks: [
    'fH7LL0l7J9', // EBS Active Volumes
    'TyfdMXG69d', // ENA Driver Version for EC2 Windows Instances
    'V77iOLlBqz', // EC2Config Service for EC2 Windows Instances
    'Wnwm9Il5bG', // PV Driver Version for EC2 Windows Instances
    'yHAGQJV9K5' // NVMe Driver Version for EC2 Windows Instances
  ],
  /*
    These checks aren't refreshable via the API.
    This isn't included in the AWS documentation,
    but it is mentioned in the Trusted Advisor console.

    These checks are automatically refreshed multiple times a day by AWS.
  */
  unrefreshableChecks: [
    '0t121N1Ty3', // AWS Direct Connect Connection Redundancy
    '12Fnkpl8Y5', // Exposed Access Keys
    '4g3Nt5M1Th', // AWS Direct Connect Virtual Interface Redundancy
    '8M012Ph3U5', // AWS Direct Connect Location Redundancy
    'Cm24dfsM12', // Amazon Comprehend Underutilized Endpoints
    'Cm24dfsM13', // Amazon Comprehend Endpoint Access Risk
    'ePs02jT06w', // Amazon EBS Public Snapshots
    'Hs4Ma3G100', // Amazon SageMaker notebook instances should not have direct internet access
    'Hs4Ma3G101', // Amazon Elastic MapReduce cluster master nodes should not have public IP addresses
    'Hs4Ma3G102', // Connections to Amazon Redshift clusters should be encrypted in transit
    'Hs4Ma3G103', // Amazon Redshift clusters should prohibit public access
    'Hs4Ma3G104', // Redshift clusters should use enhanced VPC routing
    'Hs4Ma3G105', // Amazon Redshift should have automatic upgrades to major versions enabled
    'Hs4Ma3G106', // Amazon Redshift clusters should have audit logging enabled
    'Hs4Ma3G107', // Cannot refresh CloudFront distributions should require encryption in transit
    'Hs4Ma3G108', // Cannot refresh CloudTrail trails should be integrated with Amazon CloudWatch Logs
    'Hs4Ma3G109', // CloudTrail log file validation should be enabled
    'Hs4Ma3G110', // CloudTrail should have encryption at-rest enabled
    'Hs4Ma3G111', // CloudTrail should be enabled and configured with at least one multi-region trail
    'Hs4Ma3G112', // Secrets Manager secrets should be rotated within a specified number of days
    'Hs4Ma3G113', // Secrets Manager secrets configured with automatic rotation should rotate successfully
    'Hs4Ma3G114', // Remove unused Secrets Manager secrets
    'Hs4Ma3G115', // Secrets Manager secrets should have automatic rotation enabled
    'Hs4Ma3G116', // EBS snapshots should not be public, determined by the ability to be restorable by anyone
    'Hs4Ma3G117', // Attached EBS volumes should be encrypted at-rest
    'Hs4Ma3G118', // The VPC default security group should not allow inbound and outbound traffic
    'Hs4Ma3G119', // EBS volumes should be attached to EC2 instances
    'Hs4Ma3G120', // Stopped EC2 instances should be removed after a specified time period
    'Hs4Ma3G121', // EBS default encryption should be enabled
    'Hs4Ma3G122', // VPC flow logging should be enabled in all VPCs
    'Hs4Ma3G123', // EC2 instances should not have a public IPv4 address
    'Hs4Ma3G124', // EC2 instances should use Instance Metadata Service Version 2
    'Hs4Ma3G125', // API Gateway should be associated with a WAF Web ACL
    'Hs4Ma3G126', // DynamoDB Accelerator (DAX) clusters should be encrypted at rest
    'Hs4Ma3G127', // API Gateway REST and WebSocket API execution logging should be enabled
    'Hs4Ma3G128', // API Gateway REST API stages should be configured to use SSL certificates for backend authentication
    'Hs4Ma3G129', // API Gateway REST API stages should have AWS X-Ray tracing enabled
    'Hs4Ma3G130', // Lambda functions should use supported runtimes
    'Hs4Ma3G131', // Lambda function policies should prohibit public access
    'Hs4Ma3G132', // Database Migration Service replication instances should not be public
    'Hs4Ma3G133', // IAM customer managed policies should not allow decryption actions on all KMS keys
    'Hs4Ma3G134', // Cannot refresh IAM principals should not have IAM inline policies that allow decryption actions on all KMS keys
    'Hs4Ma3G135', // AWS KMS keys should not be deleted unintentionally
    'Hs4Ma3G136', // Cannot refresh Amazon SQS queues should be encrypted at rest
    'Hs4Ma3G137', // IAM policies should not allow full "*" administrative privileges
    'Hs4Ma3G138', // IAM users should not have IAM policies attached
    'Hs4Ma3G139', // IAM users' access keys should be rotated every 90 days or less
    'Hs4Ma3G140', // IAM root user access key should not exist
    'Hs4Ma3G141', // MFA should be enabled for all IAM users that have a console password
    'Hs4Ma3G142', // Hardware MFA should be enabled for the root user
    'Hs4Ma3G143', // Password policies for IAM users should have strong configurations
    'Hs4Ma3G144', // Unused IAM user credentials should be removed
    'Hs4Ma3G145', // Amazon ECS task definitions should have secure networking modes and user definitions
    'Hs4Ma3G146', // ECS services should not have public IP addresses assigned to them automatically
    'Hs4Ma3G147', // Amazon Elasticsearch Service domains should be in a VPC
    'Hs4Ma3G148', // Elastic Beanstalk environments should have enhanced health reporting enabled
    'Hs4Ma3G149', // Elastic Beanstalk managed platform updates should be enabled
    'Hs4Ma3G150', // Elasticsearch domains should encrypt data sent between nodes
    'Hs4Ma3G151', // An RDS event notifications subscription should be configured for critical database parameter group events
    'Hs4Ma3G152', // An RDS event notifications subscription should be configured for critical database instance events
    'Hs4Ma3G153', // RDS instances should not use a database engine default port
    'Hs4Ma3G154', // An RDS event notifications subscription should be configured for critical database security group events
    'Hs4Ma3G155', // EC2 instances should be managed by AWS Systems Manager
    'Hs4Ma3G156', // EC2 instances managed by Systems Manager should have a patch compliance status of COMPLIANT after a patch installation
    'Hs4Ma3G157', // EC2 instances managed by Systems Manager should have an association compliance status of COMPLIANT
    'Hs4Ma3G158', // SSM documents should not be public
    'Hs4Ma3G159', // Elastic File System should be configured to encrypt file data at-rest using AWS KMS
    'Hs4Ma3G160', // IAM authentication should be configured for RDS instances
    'Hs4Ma3G161', // IAM authentication should be configured for RDS clusters
    'Hs4Ma3G162', // RDS automatic minor version upgrades should be enabled
    'Hs4Ma3G163', // RDS DB clusters should be configured to copy tags to snapshots
    'Hs4Ma3G164', // RDS DB instances should be configured to copy tags to snapshots
    'Hs4Ma3G165', // RDS instances should be deployed in a VPC
    'Hs4Ma3G166', // An RDS event notifications subscription should be configured for critical cluster events
    'Hs4Ma3G167', // S3 buckets should have server-side encryption enabled
    'Hs4Ma3G168', // S3 buckets should require requests to use Secure Socket Layer
    'Hs4Ma3G169', // S3 permissions granted to other AWS accounts in bucket policies should be restricted
    'Hs4Ma3G170', // S3 Block Public Access setting should be enabled
    'Hs4Ma3G171', // S3 buckets should prohibit public read access
    'Hs4Ma3G172', // S3 buckets should prohibit public write access
    'Hs4Ma3G173', // S3 Block Public Access setting should be enabled at the bucket-level
    'Hs4Ma3G174', // CodeBuild GitHub or Bitbucket source repository URLs should use OAuth
    'Hs4Ma3G175', // CodeBuild project environment variables should not contain clear text credentials
    'Hs4Ma3G176', // ACM certificates should be renewed after a specified time period
    'Hs4Ma3G177', // Auto scaling groups associated with a load balancer should use load balancer health checks
    'Hs4Ma3G178', // Security groups should only allow unrestricted incoming traffic for authorized ports
    'Hs4Ma3G179', // SNS topics should be encrypted at-rest using AWS KMS
    'Hs4Ma3G180', // Amazon Elasticsearch Service domain error logging to CloudWatch Logs should be enabled
    'Hs4Ma3G181', // Classic Load Balancers with SSL/HTTPS listeners should use a certificate provided by AWS Certificate Manager'
    'Hs4Ma3G182', // Classic Load Balancer listeners should be configured with HTTPS or TLS termination
    'Hs4Ma3G183', // Application load balancer should be configured to drop http headers
    'Hs4Ma3G184', // Application and Classic Load Balancers logging should be enabled
    'Hs4Ma3G185', // IAM customer managed policies that you create should not allow wildcard actions for services
    'Hs4Ma3G186', // AWS WAF Classic Global Web ACL logging should be enabled
    'Hs4Ma3G187', // Connections to Amazon Elasticsearch Service domains should be encrypted using TLS 1.2
    'Hs4Ma3G188', // GuardDuty should be enabled
    'Hs4Ma3G189', // Enhanced monitoring should be configured for RDS DB instances
    'Hs4Ma3G190', // RDS clusters should have deletion protection enabled
    'Hs4Ma3G191', // RDS cluster snapshots and database snapshots should be encrypted at rest
    'Hs4Ma3G192', // RDS DB Instances should prohibit public access, determined by the PubliclyAccessible configuration
    'Hs4Ma3G193', // RDS DB instances should have encryption at-rest enabled
    'Hs4Ma3G194', // RDS snapshot should be private
    'Hs4Ma3G195', // CloudFront distributions should have origin access identity enabled
    'Hs4Ma3G196', // AWS Config should be enabled
    'Hs4Ma3G197', // Amazon Elasticsearch Service domains should have encryption at-rest enabled
    'Hs4Ma3G198', // RDS DB instances should have deletion protection enabled
    'Hs4Ma3G199', // Database logging should be enabled
    'Hs4Ma3G200', // CloudFront distributions should have a default root object configured
    'Hs4Ma3G201', // CloudFront distributions should have WAF enabled
    'Hs4Ma3G202', // API Gateway REST API cache data should be encrypted at rest
    'Hs4Ma3G203', // Amazon Elasticsearch Service domains should have audit logging enabled
    'Hs4Ma3G204', // Security groups should not allow unrestricted access to ports with high risk
    'Hs4Ma3G205', // Classic Load Balancers with HTTPS/SSL listeners should use a predefined security policy that has strong configuration
    'Hs4Ma3G206', // Amazon EC2 should be configured to use VPC endpoints that are created for the Amazon EC2 service
    'Hs4Ma3G207', // EC2 subnets should not automatically assign public IP addresses
    'Hs4Ma3G208', // EC2 instances should not use multiple ENIs
    'Hs4Ma3G209', // Unused Network Access Control Lists should be removed
    'Hs4Ma3G210', // CloudFront distributions should have logging enabled
    'L4dfs2Q3C2', // AWS Lambda Functions with High Error Rates
    'L4dfs2Q3C3', // AWS Lambda Functions with Excessive Timeouts
    'L4dfs2Q4C5', // AWS Lambda Functions Using Deprecated Runtimes
    'L4dfs2Q4C6', // AWS Lambda VPC-enabled Functions without Multi-AZ Redundancy
    'Qsdfp3A4L1', // Amazon EC2 instances over-provisioned for Microsoft SQL Server
    'Qsdfp3A4L2', // Amazon EC2 instances consolidation for Microsoft SQL Server
    'Qsdfp3A4L3', // Amazon EC2 instances with Microsoft SQL Server end of support
    'rSs93HQwa1', // Amazon RDS Public Snapshots
    'Wxdfp4B1L1', // AWS Well-Architected high risk issues for cost optimization
    'Wxdfp4B1L2', // AWS Well-Architected high risk issues for performance efficiency
    'Wxdfp4B1L3', // AWS Well-Architected high risk issues for security
    'Wxdfp4B1L4' // AWS Well-Architected high risk issues for reliability
  ],
  describeTrustedAdvisorChecks () {
    return support.describeTrustedAdvisorChecks({
      language: 'en'
    }).promise().then(data => data.checks).catch(error => {
      console.log('[error] Cannot run support.describeTrustedAdvisorChecks:', error)
      throw new Error(error)
    })
  },
  refreshTrustedAdvisorCheck (checkId) {
    return support.refreshTrustedAdvisorCheck({
      checkId: checkId
    }).promise()
  }
}

module.exports = utilities
