variable "payment_lambdas" {
  description = "Information about the payment lambda functions"
  type = map(object({
    function_name = string
    arn           = string
    invoke_arn    = string
  }))
}

variable "api_gateway_id" {
  description = "API Gateway ID"
  type        = string
}

variable "api_gateway_arn" {
  description = "API Gateway ARN"
  type        = string
}