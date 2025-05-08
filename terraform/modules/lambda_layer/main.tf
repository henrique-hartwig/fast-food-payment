resource "aws_lambda_layer_version" "lambda_layer" {
  filename   = "${path.module}/fastfood-payment-lambda-layer.zip"
  layer_name = "fastfood-payment-lambda-layer"
  compatible_runtimes = ["nodejs18.x"]
  skip_destroy = true
  description = "Fast Food Payment Lambda Layer"
}
