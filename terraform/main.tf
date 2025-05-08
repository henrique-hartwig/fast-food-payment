locals {
  vpc_id             = data.terraform_remote_state.network.outputs.vpc_id
  public_subnet_ids  = data.terraform_remote_state.network.outputs.public_subnet_ids
  private_subnet_ids = data.terraform_remote_state.network.outputs.private_subnet_ids
  api_id             = data.terraform_remote_state.api_gateway.outputs.api_gateway_id
  api_endpoint       = data.terraform_remote_state.api_gateway.outputs.api_gateway_endpoint
  api_execution_arn  = data.terraform_remote_state.api_gateway.outputs.api_gateway_execution_arn
}

module "database" {
  source = "./modules/database"

  environment       = var.environment
  db_instance_class = var.db_instance_class
  db_name           = var.db_name
  db_username       = var.db_username
  db_password       = var.db_password
  db_port           = var.db_port
  vpc_id            = local.vpc_id
  subnet_ids        = local.public_subnet_ids
}

module "payment" {
  source = "./modules/lambda/payment"

  environment        = var.environment
  database_url       = var.database_url
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
