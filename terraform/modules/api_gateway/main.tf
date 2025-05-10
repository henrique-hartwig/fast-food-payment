resource "aws_apigatewayv2_integration" "create_payment" {
  api_id                 = var.api_gateway_id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.payment_lambdas.create.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "create_payment" {
  api_id    = var.api_gateway_id
  route_key = "POST /payment"
  target    = "integrations/${aws_apigatewayv2_integration.create_payment.id}"
}

resource "aws_lambda_permission" "create_payment" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.payment_lambdas.create.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_arn}/*/*/payment"
}