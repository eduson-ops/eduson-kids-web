variable "cloud_id" {
  description = "Yandex Cloud ID"
  type        = string
}

variable "folder_id" {
  description = "Yandex Cloud Folder ID"
  type        = string
}

variable "zone" {
  description = "Availability zone"
  type        = string
  default     = "ru-central1-a"
}

variable "region" {
  description = "Region (FZ-152 compliant: ru-central1)"
  type        = string
  default     = "ru-central1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "db_user" {
  description = "PostgreSQL user"
  type        = string
  default     = "eduson"
}

variable "container_registry_id" {
  description = "YC Container Registry ID"
  type        = string
}

variable "api_image" {
  description = "Docker image for API service (registry.yandex.net/...)"
  type        = string
}

variable "service_account_id" {
  description = "Service account ID for serverless container"
  type        = string
  default     = ""
}
