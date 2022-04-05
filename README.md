# Modernisation Platform Terraform Trusted Advisor
[![repo standards badge](https://img.shields.io/badge/dynamic/json?color=blue&style=for-the-badge&logo=github&label=MoJ%20Compliant&query=%24.data%5B%3F%28%40.name%20%3D%3D%20%22modernisation-platform-terraform-trusted-advisor%22%29%5D.status&url=https%3A%2F%2Foperations-engineering-reports.cloud-platform.service.justice.gov.uk%2Fgithub_repositories)](https://operations-engineering-reports.cloud-platform.service.justice.gov.uk/github_repositories#modernisation-platform-terraform-trusted-advisor "Link to report")

Terraform module to refresh [AWS Trusted Advisor](https://aws.amazon.com/premiumsupport/technology/trusted-advisor/).

>This uses the AWS Support API, which is only available in us-east-1.

## Usage

```
module "trusted-advisor" {
  source = "github.com/ministryofjustice/modernisation-platform-terraform-trusted-advisor"
}
```

## Inputs
| Name | Description                | Type | Default | Required |
|------|----------------------------|------|---------|----------|
| tags | Tags to apply to resources | map  | {}      | no       |

## Outputs
None.

## Looking for issues?
If you're looking to raise an issue with this module, please create a new issue in the [Modernisation Platform repository](https://github.com/ministryofjustice/modernisation-platform/issues).
