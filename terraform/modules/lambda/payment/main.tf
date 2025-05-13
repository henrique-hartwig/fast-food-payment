resource "aws_security_group" "lambda_sg" {
  name        = "${var.lambda_name}-lambda-sg-${var.environment}"
  description = "Security group for the ${var.lambda_name} Lambda function"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.lambda_name} Security Group"
  })
}

locals {
  lambda_functions = {
    create = {
      name        = "create-payment"
      description = "Create a new payment"
      handler     = ".build/payment/useCases/create/handler.handler"
    },
    get = {
      name        = "get-payment"
      description = "Get a payment by ID"
      handler     = ".build/payment/useCases/get/handler.handler"
    },
    list = {
      name        = "list-payments"
      description = "List payments with pagination"
      handler     = ".build/payment/useCases/list/handler.handler"
    },
    update = {
      name        = "update-payment"
      description = "Update an existing payment"
      handler     = ".build/payment/useCases/update/handler.handler"
    },
    delete = {
      name        = "delete-payment"
      description = "Remove a payment"
      handler     = ".build/payment/useCases/delete/handler.handler"
    }
  }
}

resource "aws_lambda_function" "payment_functions" {
  for_each = local.lambda_functions

  function_name = "fast-food-payment-${each.value.name}-${var.environment}"
  description   = each.value.description
  role          = "arn:aws:iam::992382498858:role/LabRole"
  handler       = each.value.handler

  filename         = "${path.module}/../../../../dist/payment/${each.key}.zip"
  source_code_hash = filebase64sha256("${path.module}/../../../../dist/payment/${each.key}.zip")

  layers = var.lambda_layers

  runtime     = "nodejs18.x"
  memory_size = var.lambda_memory_size
  timeout     = var.lambda_timeout

  environment {
    variables = {
      NODE_ENV   = var.environment
      TABLE_NAME = var.table_name
      ORDERS_QUEUE_URL  = var.orders_queue_url
    }
  }

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [aws_security_group.lambda_sg.id]
  }

  tags = {
    Environment = var.environment
    Service     = "payment"
  }
}

resource "aws_lambda_event_source_mapping" "payment_queue_mapping" {
  event_source_arn = var.orders_queue_arn
  function_name    = aws_lambda_function.payment_functions["create"].arn
  batch_size       = 10
  enabled          = true
}