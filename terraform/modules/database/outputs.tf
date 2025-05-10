output "dynamodb_table_payments_name" {
  value       = aws_dynamodb_table.db_fast_food_payments.name
  description = "Nome da tabela DynamoDB de pagamentos"
}
