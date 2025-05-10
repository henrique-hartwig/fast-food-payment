variable "aws_region" {
  description = "The AWS region to deploy the FastFood Payments microservice."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deploy environment (dev, prod)"
  type        = string
  default     = "dev"
}

variable "lambda_memory_size" {
  description = "Memory size for the Lambda functions (MB)"
  type        = number
  default     = 256
}

variable "lambda_timeout" {
  description = "Timeout for the Lambda functions (seconds)"
  type        = number
  default     = 30
}

variable "api_name" {
  description = "Name of the API Gateway"
  type        = string
  default     = "fastfood-payments-api"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "List of CIDR blocks for the public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "List of CIDR blocks for the private subnets"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
}

variable "availability_zones" {
  description = "List of availability zones for the subnets"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "api_description" {
  description = "Description of the API Gateway"
  type        = string
  default     = "API Gateway for Fast Food Payments"
}
