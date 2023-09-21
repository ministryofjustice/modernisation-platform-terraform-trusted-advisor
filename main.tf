# IAM role
data "aws_iam_policy_document" "assume-role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "default" {
  # Allow the function to write logs
  # Ignore this check on tfsec - it causes a fail on resources *. The resource * allows the lambda (below) to access groups it needs to run
  #tfsec:ignore:aws-iam-no-policy-wildcards
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]

    resources = ["${aws_cloudwatch_log_group.default.arn}:*"]
  }

  # Support doesn't allow you to target individual resources, so we need to use *
  statement {
    effect = "Allow"
    actions = [
      "support:DescribeTrustedAdvisorChecks",
      "support:RefreshTrustedAdvisorCheck"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "default" {
  name   = var.name
  policy = data.aws_iam_policy_document.default.json
}

resource "aws_iam_role_policy_attachment" "default" {
  role       = aws_iam_role.default.name
  policy_arn = aws_iam_policy.default.arn
}

resource "aws_iam_role" "default" {
  name               = var.role_name
  assume_role_policy = data.aws_iam_policy_document.assume-role.json
}

# CloudWatch Log
# Logs do not contain sensitive data
# Ignore tfsec check. Gives a "low" error on log group not encrypted. 
# tfsec:ignore:aws-cloudwatch-log-group-customer-key
resource "aws_cloudwatch_log_group" "default" {

  # We use multiple KMS keys do this can't be set to one
  #checkov:skip=CKV_AWS_158: "Ensure that CloudWatch Log Group is encrypted by KMS"
  # We don't define how long people should keep their log groups
  #checkov:skip=CKV_AWS_338: "Ensure CloudWatch log groups retains logs for at least 1 year"

  name              = "/aws/lambda/${var.name}"
  retention_in_days = 30
  tags              = var.tags
}

# EventBridge (previously known as CloudWatch) scheduled event
resource "aws_cloudwatch_event_rule" "default" {
  name                = "run-${var.name}-hourly"
  description         = "Scheduled event for ${var.name}"
  schedule_expression = "rate(60 minutes)"
}

resource "aws_cloudwatch_event_target" "default" {
  rule = aws_cloudwatch_event_rule.default.name
  arn  = aws_lambda_function.default.arn
}

# Lambda function
## ZIP up the function
data "archive_file" "function" {
  type        = "zip"
  output_path = "${path.module}/function.zip"

  source {
    content  = file("${path.module}/function/index.js")
    filename = "index.js"
  }

  source {
    content  = file("${path.module}/function/utilities.js")
    filename = "utilities.js"
  }

  source {
    content  = file("${path.module}/function/package.json")
    filename = "package.json"
  }
}

## Give CloudWatch permission to run it (via a Scheduled Event)
resource "aws_lambda_permission" "default" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.default.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.default.arn
}

## Create the Lambda function
# tfsec tracing not required for this function
# tfsec:ignore:aws-lambda-enable-tracing
resource "aws_lambda_function" "default" {

  # None of the below are required
  #checkov:skip=CKV_AWS_50: "X-ray tracing is enabled for Lambda"
  #checkov:skip=CKV_AWS_272: "Ensure AWS Lambda function is configured to validate code-signing"
  #checkov:skip=CKV_AWS_117: "Ensure that AWS Lambda function is configured inside a VPC"
  #checkov:skip=CKV_AWS_116: "Ensure that AWS Lambda function is configured for a Dead Letter Queue(DLQ)"
  #checkov:skip=CKV_AWS_115: "Ensure that AWS Lambda function is configured for function-level concurrent execution limit"

  filename         = data.archive_file.function.output_path
  function_name    = var.name
  handler          = "index.handler"
  role             = aws_iam_role.default.arn
  runtime          = "nodejs18.x"
  source_code_hash = data.archive_file.function.output_base64sha256
  timeout          = "60"

  depends_on = [
    data.archive_file.function,
    aws_cloudwatch_log_group.default
  ]
}
