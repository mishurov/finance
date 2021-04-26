# based on https://github.com/marcelo-ochoa/oci-swarm-cluster

output "load_balancer_ip" {
  value = lookup(
    oci_load_balancer_load_balancer.balancer.ip_address_details[0],
    "ip_address"
  )
}

output "database_names" {
  value = oci_database_autonomous_database.db_instances.*.db_name
}

output "database_passwords" {
  value = random_string.db_passwords.*.result
}

output "django_passwords" {
  value = random_string.django_passwords.*.result
}

output "database_wallets_passwords" {
  value = random_string.wallets_passwords.*.result
}

output "object_storage_namespace" {
  value = oci_objectstorage_bucket.securities.namespace
}

output "object_storage_customer_access_key" {
  value = oci_identity_customer_secret_key.storage_user.id
}

output "object_storage_customer_secret_key" {
  value = oci_identity_customer_secret_key.storage_user.key
}

output "computes_private_ips" {
  value = oci_core_instance.compute_instances.*.private_ip
}

output "computes_public_ips" {
  value = oci_core_instance.compute_instances.*.public_ip
}
