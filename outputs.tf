output "lambda_function_arn" {
  description = "The ARN of the Lambda Function"
  value       = aws_lambda_function.default.arn
}

output "lambda_function_invoke_arn" {
  description = "The invoke ARN of the Lambda Function"
  value       = aws_lambda_function.default.invoke_arn
}

output "lambda_function_name" {
  description = "The Name of the Lambda Function"
  value       = aws_lambda_function.default.function_name
}

output "iam_role_arn" {
  description = "The ARN of the IAM Role that can invoke the Lambda Function"
  value       = aws_iam_role.default.arn
}
