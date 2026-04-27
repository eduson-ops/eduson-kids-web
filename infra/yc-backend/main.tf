terraform {
  required_version = ">= 1.6.0"
  required_providers {
    yandex = {
      source  = "yandex-cloud/yandex"
      version = ">= 0.100.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.5.0"
    }
  }

  # Uncomment for remote state in YC Object Storage
  # backend "s3" {
  #   endpoint   = "storage.yandexcloud.net"
  #   bucket     = "eduson-terraform-state"
  #   key        = "backend/terraform.tfstate"
  #   region     = "ru-central1"
  #   access_key = var.yc_s3_access_key
  #   secret_key = var.yc_s3_secret_key
  #   skip_region_validation      = true
  #   skip_credentials_validation = true
  # }
}

provider "yandex" {
  cloud_id  = var.cloud_id
  folder_id = var.folder_id
  zone      = var.zone
}

# ────────────────────────────────────────────────────────────────
# Networking
# ────────────────────────────────────────────────────────────────

resource "yandex_vpc_network" "eduson" {
  name      = "eduson-network"
  folder_id = var.folder_id
}

resource "yandex_vpc_subnet" "eduson_a" {
  name           = "eduson-subnet-a"
  zone           = "ru-central1-a"
  network_id     = yandex_vpc_network.eduson.id
  v4_cidr_blocks = ["10.10.0.0/24"]
}

resource "yandex_vpc_subnet" "eduson_b" {
  name           = "eduson-subnet-b"
  zone           = "ru-central1-b"
  network_id     = yandex_vpc_network.eduson.id
  v4_cidr_blocks = ["10.10.1.0/24"]
}

# ────────────────────────────────────────────────────────────────
# KMS Key for PII encryption
# ────────────────────────────────────────────────────────────────

resource "yandex_kms_symmetric_key" "pii_key" {
  name              = "eduson-pii-key"
  description       = "AES-256 key for PII field encryption"
  default_algorithm = "AES_256"
  rotation_period   = "8760h" # 1 year
  folder_id         = var.folder_id

  labels = {
    environment = var.environment
    service     = "eduson-api"
  }
}

# ────────────────────────────────────────────────────────────────
# Lockbox Secrets
# ────────────────────────────────────────────────────────────────

resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#%&*()-_=+[]{}:?"
}

resource "random_bytes" "jwt_access_secret" {
  length = 64
}

resource "random_bytes" "jwt_refresh_secret" {
  length = 64
}

resource "random_bytes" "pii_key_material" {
  length = 32
}

resource "yandex_lockbox_secret" "api_secrets" {
  name      = "eduson-api-secrets"
  folder_id = var.folder_id

  labels = {
    environment = var.environment
  }
}

resource "yandex_lockbox_secret_version" "api_secrets_v1" {
  secret_id = yandex_lockbox_secret.api_secrets.id

  entries {
    key        = "DB_PASSWORD"
    text_value = random_password.db_password.result
  }

  entries {
    key        = "JWT_ACCESS_SECRET"
    text_value = random_bytes.jwt_access_secret.hex
  }

  entries {
    key        = "JWT_REFRESH_SECRET"
    text_value = random_bytes.jwt_refresh_secret.hex
  }

  entries {
    key        = "PII_KEY"
    text_value = base64encode(random_bytes.pii_key_material.hex)
  }
}

# ────────────────────────────────────────────────────────────────
# PostgreSQL 16 (MDB)
# ────────────────────────────────────────────────────────────────

resource "yandex_mdb_postgresql_cluster" "eduson" {
  name        = "eduson-postgres"
  environment = "PRODUCTION"
  network_id  = yandex_vpc_network.eduson.id
  folder_id   = var.folder_id

  config {
    version = 16

    resources {
      resource_preset_id = "s2.micro" # 2 vCPU, 8GB RAM
      disk_type_id       = "network-ssd"
      disk_size          = 20
    }

    postgresql_config = {
      max_connections                = 200
      log_min_duration_statement     = 1000
      log_checkpoints                = true
    }
  }

  host {
    zone      = "ru-central1-a"
    subnet_id = yandex_vpc_subnet.eduson_a.id
    assign_public_ip = false
  }

  maintenance_window {
    type = "WEEKLY"
    day  = "SUN"
    hour = 3
  }

  deletion_protection = true
}

resource "yandex_mdb_postgresql_database" "eduson_kids" {
  cluster_id = yandex_mdb_postgresql_cluster.eduson.id
  name       = "eduson_kids"
  owner      = var.db_user
}

resource "yandex_mdb_postgresql_user" "eduson" {
  cluster_id = yandex_mdb_postgresql_cluster.eduson.id
  name       = var.db_user
  password   = random_password.db_password.result

  permission {
    database_name = "eduson_kids"
  }
}

# ────────────────────────────────────────────────────────────────
# Redis 7 (MDB)
# ────────────────────────────────────────────────────────────────

resource "yandex_mdb_redis_cluster" "eduson" {
  name        = "eduson-redis"
  environment = "PRODUCTION"
  network_id  = yandex_vpc_network.eduson.id
  folder_id   = var.folder_id

  config {
    version  = "7.2"
    password = random_password.db_password.result
  }

  resources {
    resource_preset_id = "hm1.nano"
    disk_type_id       = "network-ssd"
    disk_size          = 8
  }

  host {
    zone      = "ru-central1-a"
    subnet_id = yandex_vpc_subnet.eduson_a.id
  }
}

# ────────────────────────────────────────────────────────────────
# IAM Service Account for Container
# ────────────────────────────────────────────────────────────────

resource "yandex_iam_service_account" "api_sa" {
  name      = "eduson-api-sa"
  folder_id = var.folder_id
}

resource "yandex_resourcemanager_folder_iam_member" "api_sa_lockbox" {
  folder_id = var.folder_id
  role      = "lockbox.payloadViewer"
  member    = "serviceAccount:${yandex_iam_service_account.api_sa.id}"
}

resource "yandex_resourcemanager_folder_iam_member" "api_sa_cr_puller" {
  folder_id = var.folder_id
  role      = "container-registry.images.puller"
  member    = "serviceAccount:${yandex_iam_service_account.api_sa.id}"
}

resource "yandex_resourcemanager_folder_iam_member" "api_sa_kms" {
  folder_id = var.folder_id
  role      = "kms.keys.encrypterDecrypter"
  member    = "serviceAccount:${yandex_iam_service_account.api_sa.id}"
}

# ────────────────────────────────────────────────────────────────
# Serverless Container
# ────────────────────────────────────────────────────────────────

resource "yandex_serverless_container" "api" {
  name               = "eduson-api"
  folder_id          = var.folder_id
  memory             = 512
  execution_timeout  = "30s"
  cores              = 1
  core_fraction      = 100
  service_account_id = yandex_iam_service_account.api_sa.id

  image {
    url = var.api_image
    environment = {
      NODE_ENV    = "production"
      PORT        = "3000"
      DB_HOST     = yandex_mdb_postgresql_cluster.eduson.host[0].fqdn
      DB_PORT     = "6432"
      DB_USER     = var.db_user
      DB_NAME     = "eduson_kids"
      DB_SSL      = "true"
      REDIS_HOST  = yandex_mdb_redis_cluster.eduson.host[0].fqdn
      REDIS_PORT  = "6380"
    }
  }

  scaling_policy {
    test_tag {
      min_unit_count = 1
      max_unit_count = 10
    }
  }

  connectivity {
    network_id = yandex_vpc_network.eduson.id
  }
}
