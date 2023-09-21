variable "name" {
  type        = string
  description = "This is used for the Lambda name and CloudWatch Log group, which is automatically created by AWS, but we can manage it via Terraform if we use the same name"
  default     = "trusted-advisor-refresh"
}

variable "tags" {
  type        = map(any)
  description = "Tags to apply to resources, where applicable"
  default     = {}
}
