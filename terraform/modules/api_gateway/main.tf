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

resource "aws_apigatewayv2_integration" "get_payment" {
  api_id                 = var.api_gateway_id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.payment_lambdas.get.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_payment" {
  api_id    = var.api_gateway_id
  route_key = "GET /payment"
  target    = "integrations/${aws_apigatewayv2_integration.get_payment.id}"
}

resource "aws_lambda_permission" "get_payment" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.payment_lambdas.get.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_arn}/*/*/payment"
}

resource "aws_apigatewayv2_integration" "update_payment" {
  api_id                 = var.api_gateway_id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.payment_lambdas.update.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "update_payment" {
  api_id    = var.api_gateway_id
  route_key = "PUT /payment"
  target    = "integrations/${aws_apigatewayv2_integration.update_payment.id}"
}

resource "aws_lambda_permission" "update_payment" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.payment_lambdas.update.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_arn}/*/*/payment"
}

resource "aws_apigatewayv2_integration" "delete_payment" {
  api_id                 = var.api_gateway_id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.payment_lambdas.delete.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "delete_payment" {
  api_id    = var.api_gateway_id
  route_key = "DELETE /payment"
  target    = "integrations/${aws_apigatewayv2_integration.delete_payment.id}"
}

resource "aws_lambda_permission" "delete_payment" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.payment_lambdas.delete.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_arn}/*/*/payment"
}
