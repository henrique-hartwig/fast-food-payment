resource "aws_lambda_layer_version" "lambda_layer" {
  filename   = "${path.module}/fastfood-lambda-layer.zip"
  layer_name = "fastfood-lambda-layer"
  compatible_runtimes = ["nodejs18.x"]
  skip_destroy = true
  description = "Fast Food Lambda Layer"
}
