locals {
  vpc_id             = data.terraform_remote_state.fastfood_orders.outputs.vpc_id
  public_subnet_ids  = data.terraform_remote_state.fastfood_orders.outputs.public_subnet_ids
  private_subnet_ids = data.terraform_remote_state.fastfood_orders.outputs.private_subnet_ids
  api_id             = data.terraform_remote_state.fastfood_orders.outputs.api_gateway_id
  api_endpoint       = data.terraform_remote_state.fastfood_orders.outputs.api_gateway_url
  api_execution_arn  = data.terraform_remote_state.fastfood_orders.outputs.api_gateway_execution_arn
}

module "database" {
  source      = "./modules/database"
  environment = var.environment
}

module "payment" {
  source = "./modules/lambda/payment"

  environment        = var.environment
  table_name         = module.database.dynamodb_table_payments_name
  vpc_id             = local.vpc_id
  subnet_ids         = local.private_subnet_ids
  lambda_memory_size = var.lambda_memory_size
  lambda_timeout     = var.lambda_timeout
  lambda_layers      = [module.lambda_layer.lambda_layer_arn]
  tags = {
    Service = "Payment"
  }
}

module "lambda_layer" {
  source = "./modules/lambda_layer"
}
