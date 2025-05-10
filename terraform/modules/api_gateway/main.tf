
################################################################################
# Payment
################################################################################

resource "aws_apigatewayv2_integration" "create_payment" {
  api_id             = var.api_gateway_id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.payment_lambdas.create.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "create_payment" {
  api_id    = var.api_gateway_id
  route_key = "POST /payment"
  target    = "integrations/${aws_apigatewayv2_integration.create_payment.id}"
}
