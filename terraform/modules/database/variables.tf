variable "environment" {
  type        = string
  description = "Deployment environment (dev, prod)"
  default     = "dev"
}

variable "db_instance_class" {
  type        = string
  description = "RDS instance class"
  default     = "db.t3.micro"
}

variable "db_name" {
  type        = string
  description = "Database name"
  default     = "fast_food_payments"
}

variable "db_username" {
  type        = string
  description = "Database username"
  sensitive   = true
}

variable "db_password" {
  type        = string
  description = "Database password"
  sensitive   = true
}

variable "db_port" {
  type        = number
  description = "Database port"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID where the database will be deployed"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Subnet IDs where the database will be deployed"
} 