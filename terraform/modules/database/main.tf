resource "aws_dynamodb_table" "db_fast_food_payments" {
  name         = "fast-food-payments-db-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "N"
  }

  global_secondary_index {
    name               = "orderId-index"
    hash_key           = "orderId"
    projection_type    = "ALL"
  }

  attribute {
    name = "orderId"
    type = "N"
  }

  tags = {
    Name        = "Fast Food Payment Database"
    Environment = var.environment
  }
}