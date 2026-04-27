output "postgres_host" {
  description = "PostgreSQL cluster FQDN"
  value       = yandex_mdb_postgresql_cluster.eduson.host[0].fqdn
}

output "redis_host" {
  description = "Redis cluster FQDN"
  value       = yandex_mdb_redis_cluster.eduson.host[0].fqdn
}

output "api_container_id" {
  description = "Serverless container ID"
  value       = yandex_serverless_container.api.id
}

output "api_container_url" {
  description = "Serverless container invoke URL"
  value       = yandex_serverless_container.api.url
}

output "lockbox_secret_id" {
  description = "Lockbox secret ID (reference in CI)"
  value       = yandex_lockbox_secret.api_secrets.id
}

output "kms_key_id" {
  description = "KMS key ID for PII encryption"
  value       = yandex_kms_symmetric_key.pii_key.id
  sensitive   = true
}

output "service_account_id" {
  description = "API service account ID"
  value       = yandex_iam_service_account.api_sa.id
}
