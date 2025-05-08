resource "aws_db_subnet_group" "subnet_group_fast_food_payments" {
  name       = "fast-food-payment-subnet-group-${var.environment}"
  subnet_ids = data.terraform_remote_state.existing_resources.outputs.public_subnets

  tags = {
    Name        = "Fast Food Payments DB Subnet Group"
    Environment = var.environment
  }
}

resource "aws_security_group" "security_group_fast_food_payments" {
  name        = "fast-food-payment-sg-${var.environment}"
  description = "Allow database traffic for Payment microservice"
  vpc_id      = data.terraform_remote_state.existing_resources.outputs.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16", "0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "Fast Food Payment RDS Security Group"
    Environment = var.environment
  }
}

resource "aws_db_instance" "db_fast_food_payments" {
  identifier             = "fast-food-payment-db-${var.environment}"
  engine                 = "postgres"
  engine_version         = "14"
  instance_class         = var.db_instance_class
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp2"
  db_name                = var.db_name
  username               = var.db_username
  port                   = var.db_port
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.subnet_group_fast_food_payments.name
  vpc_security_group_ids = [aws_security_group.security_group_fast_food_payments.id]
  skip_final_snapshot    = true
  deletion_protection    = var.environment == "prod" ? true : false
  backup_retention_period = var.environment == "prod" ? 14 : 7
  publicly_accessible    = true
  tags = {
    Name        = "Fast Food Payments Database"
    Environment = var.environment
  }
}

resource "aws_dynamodb_table" "db_fast_food_payments" {
  name         = "fast-food-payments-db-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  global_secondary_index {
    name               = "orderId-index"
    hash_key           = "orderId"
    projection_type    = "ALL"
  }

  attribute {
    name = "orderId"
    type = "S"
  }

  tags = {
    Name        = "Fast Food Payment Database"
    Environment = var.environment
  }
}