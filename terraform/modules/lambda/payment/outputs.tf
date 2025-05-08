output "lambda_functions" {
  value = {
    for k, v in aws_lambda_function.payment_functions : k => {
      function_name = v.function_name
      arn           = v.arn
      invoke_arn    = v.invoke_arn
    }
  }
  description = "Details of the Lambda functions created"
}
