# modernisation-platform-terraform-trusted-advisor

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
