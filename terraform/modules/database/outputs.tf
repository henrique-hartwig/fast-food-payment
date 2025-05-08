output "db_instance_endpoint" {
  value       = aws_db_instance.db_fast_food_payments.endpoint
  description = "Database endpoint"
}

output "db_instance_address" {
  value       = aws_db_instance.db_fast_food_payments.address
  description = "Database address"
}
