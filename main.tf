terraform {
  backend "s3" {
    key = "tfstate"
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_caller_identity" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id
}

resource "aws_s3_bucket" "tfstate" {
  bucket = "tf-${local.account_id}"
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.tfstate.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action    = ["s3:GetObject"],
        Effect    = "Allow",
        Resource  = ["arn:aws:s3:::${aws_s3_bucket.tfstate.bucket}/*"],
        Principal = "*"
      },
    ]
  })
}

resource "aws_s3_bucket_website_configuration" "tfstate_website" {
  bucket = aws_s3_bucket.tfstate.bucket

  index_document {
    suffix = "index.html"
  }
}

output "website_url" {
  value = aws_s3_bucket.tfstate.website_endpoint
}
