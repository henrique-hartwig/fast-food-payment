variable "environment" {
  description = "The environment to deploy (dev, prod)"
  type        = string
  default     = "dev"
}

output "fast_food_payment_production_queue_url" {
  description = "SQS URL for fast food payment production queue"
  value       = aws_sqs_queue.fast_food_payment_production_queue.id
}

output "fast_food_payment_production_queue_arn" {
  description = "SQS ARN for fast food payment production queue"
  value       = aws_sqs_queue.fast_food_payment_production_queue.arn
}
