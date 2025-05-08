provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Fast Food Payment Microservice"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "fastfood-payment-terraform-state"
    key    = "infra/state.tfstate"
    region = "us-east-1"
  }
}

data "terraform_remote_state" "fastfood_orders" {
  backend = "s3"
  config = {
    bucket = "fastfood-orders-terraform-state"
    key    = "infra/state.tfstate"
    region = "us-east-1"
  }
}