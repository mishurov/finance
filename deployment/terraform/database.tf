# based on https://github.com/marcelo-ochoa/oci-swarm-cluster

resource "random_string" "db_passwords" {
  length           = 16
  special          = "true"
  min_upper        = 3
  min_lower        = 3
  min_numeric      = 3
  min_special      = 3
  override_special = "{}#^*<>[]%~"

  count = 2
}

resource "random_string" "wallets_passwords" {
  length           = 16
  special          = "true"
  min_upper        = 3
  min_lower        = 3
  min_numeric      = 3
  min_special      = 3
  override_special = "{}#^*<>[]%~"

  count = 2
}

resource "random_string" "django_passwords" {
  length           = 16
  special          = "true"
  min_upper        = 3
  min_lower        = 3
  min_numeric      = 3
  min_special      = 3
  override_special = "{}#^*<>[]%~"

  count = 2
}

resource "oci_database_autonomous_database" "db_instances" {
  admin_password           = element(
    random_string.db_passwords.*.result, count.index
  )
  compartment_id           = var.compartment_ocid
  cpu_core_count           = "1"
  data_storage_size_in_tbs = "1"
  db_name                  = "${var.db_names[count.index]}db"

  db_workload              = "OLTP"
  db_version               = var.db_version
  display_name             = var.db_names[count.index]

  is_auto_scaling_enabled = "false"
  license_model           = "LICENSE_INCLUDED"
  is_free_tier            = "true"

  count = 2
}

resource "oci_database_autonomous_database_wallet" "wallets" {
  autonomous_database_id = oci_database_autonomous_database.db_instances[count.index].id
  password               = random_string.wallets_passwords[count.index].result

  base64_encode_content = "true"
  generate_type = "SINGLE"

  count = 2
}

resource "local_file" "wallet_files" {
  content_base64 = oci_database_autonomous_database_wallet.wallets[count.index].content
  filename       = "${path.module}/wallet${count.index}.zip"

  count = 2
}
