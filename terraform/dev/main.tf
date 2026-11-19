terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

variable "aws_account_id" {
  description = "AWS account ID dedicated to dev. The backend uses fixed queue names."
  type        = string

  validation {
    condition     = can(regex("^[0-9]{12}$", var.aws_account_id))
    error_message = "Use a 12-digit AWS account ID."
  }
}

variable "aws_region" {
  description = "Region used by the dev backend and its verified SES identity."
  type        = string
  default     = "us-east-1"
}

variable "ses_identity" {
  description = "Existing verified SES email address or domain used to authorize the sender."
  type        = string
}

variable "ses_configuration_set" {
  description = "Existing SES configuration set for the backend when dev archiving is disabled."
  type        = string
  default     = null
}

provider "aws" {
  region              = var.aws_region
  allowed_account_ids = [var.aws_account_id]

  default_tags {
    tags = {
      Environment = "dev"
      Project     = "open-bus-backend"
    }
  }
}

data "aws_partition" "current" {}

locals {
  ses_arn_prefix        = "arn:${data.aws_partition.current.partition}:ses:${var.aws_region}:${var.aws_account_id}"
  ses_configuration_set = var.ses_configuration_set != null ? var.ses_configuration_set : aws_cloudformation_stack.ses_archive[0].outputs.ConfigurationSetName
}

resource "aws_mailmanager_archive" "complaints" {
  count = var.ses_configuration_set == null ? 1 : 0
  name  = "open-bus-backend-dev-archive"

  retention {
    retention_period = "SIX_MONTHS"
  }
}

# The AWS provider's native SES configuration set resource lacks archiving options.
resource "aws_cloudformation_stack" "ses_archive" {
  count = var.ses_configuration_set == null ? 1 : 0
  name  = "open-bus-backend-dev-ses-archive"

  template_body = jsonencode({
    Resources = {
      ConfigurationSet = {
        Type = "AWS::SES::ConfigurationSet"
        Properties = {
          Name             = "open-bus-backend-dev-archive"
          ArchivingOptions = { ArchiveArn = aws_mailmanager_archive.complaints[0].arn }
        }
      }
    }
    Outputs = {
      ConfigurationSetName = { Value = { Ref = "ConfigurationSet" } }
    }
  })

}

resource "aws_sqs_queue" "complaints_dlq" {
  name                    = "complaints-dlq"
  sqs_managed_sse_enabled = true
}

resource "aws_sqs_queue" "complaints" {
  name                    = "complaints"
  sqs_managed_sse_enabled = true

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.complaints_dlq.arn
    maxReceiveCount     = 5
  })
}

resource "aws_iam_policy" "backend" {
  name = "open-bus-backend-dev"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat([
      {
        Effect = "Allow"
        Action = [
          "sqs:CreateQueue",
          "sqs:GetQueueAttributes",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
        ]
        Resource = [aws_sqs_queue.complaints.arn, aws_sqs_queue.complaints_dlq.arn]
      },
      {
        Effect   = "Allow"
        Action   = "sqs:SendMessage"
        Resource = aws_sqs_queue.complaints.arn
      },
      {
        Effect = "Allow"
        Action = "ses:SendEmail"
        Resource = concat(
          ["${local.ses_arn_prefix}:identity/${var.ses_identity}"],
          local.ses_configuration_set == null ? [] : ["${local.ses_arn_prefix}:configuration-set/${local.ses_configuration_set}"],
        )
      },
      ], [for archive in aws_mailmanager_archive.complaints : {
        Effect   = "Allow"
        Action   = "ses:Archive"
        Resource = archive.arn
    }])
  })
}

output "backend_policy_arn" {
  description = "Attach this policy to the dev backend's AWS identity."
  value       = aws_iam_policy.backend.arn
}

output "ses_configuration_set" {
  description = "Set SES_CONFIGURATION_SET to this value in the backend environment."
  value       = local.ses_configuration_set
}

output "ses_archive_arn" {
  description = "ARN of the Mail Manager archive created for dev."
  value       = one(aws_mailmanager_archive.complaints[*].arn)
}
