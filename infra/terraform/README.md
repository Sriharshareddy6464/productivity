# Terraform AWS Infrastructure

This directory contains Terraform configurations for deploying the productivity platform on AWS.

## Prerequisites

- Terraform >= 1.5
- AWS CLI configured with appropriate credentials

## Usage

```bash
# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Apply infrastructure
terraform apply

# Destroy infrastructure
terraform destroy
```

## Resources

- VPC with public/private subnets
- RDS MySQL 8.0 instance (db.t3.medium)
- ECS cluster stub
- Security groups
