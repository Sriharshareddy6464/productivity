output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.main.id
}

output "rds_endpoint" {
  description = "Connection endpoint of the RDS instance"
  value       = aws_db_instance.main.endpoint
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}
