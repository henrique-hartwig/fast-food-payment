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

variable "vpc_id" {
  description = "ID of the VPC where the Lambda functions will be deployed"
  type        = string
}

variable "subnet_ids" {
  description = "IDs of the subnets where the Lambda functions will be deployed"
  type        = list(string)
}

variable "lambda_name" {
  description = "Base name of the Lambda function"
  type        = string
  default     = "fast-food-payment"
}

variable "lambda_description" {
  description = "Description of the Lambda function"
  type        = string
  default     = "Lambda function to manage payments"
}

variable "tags" {
  description = "Tags to be applied to the resources"
  type        = map(string)
  default     = {}
}

variable "lambda_layers" {
  description = "Lambda Layers ARN"
  type        = list(string)
}

variable "database_url" {
  description = "Database URL"
  type        = string
}