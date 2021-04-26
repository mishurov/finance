# based on https://github.com/marcelo-ochoa/oci-swarm-cluster

resource "oci_identity_group" "storage_users" {
  compartment_id = var.compartment_ocid
  description = "Group for Object Storage users"
  name = "ObjectStorageRW"
}

resource "oci_identity_group" "lb_users" {
  compartment_id = var.compartment_ocid
  description = "Group for Load Balancer users"
  name = "LoadBalancerU"
}

resource "oci_identity_policy" "storage_policy" {
  name = "ObjectStorageRW"
  description = "CRUD objects in buckets"
  compartment_id = var.compartment_ocid

  statements = [
    "Allow group ${oci_identity_group.storage_users.name} to read buckets IN TENANCY",
    "Allow group ${oci_identity_group.storage_users.name} to manage objects IN TENANCY",
  ]
}

resource "oci_identity_policy" "lb_policy" {
  name = "LoadBalancerU"
  description = "Update Load Balancers"
  compartment_id = var.compartment_ocid

  statements = [
    "Allow group ${oci_identity_group.lb_users.name} to use load-balancers IN TENANCY"
  ]
}

resource "oci_identity_user" "storage_user" {
    compartment_id = var.tenancy_ocid
    description = "User to access Object Storage"
    name = "django"
}

resource "oci_identity_user" "lb_user" {
    compartment_id = var.tenancy_ocid
    description = "User to update Load Balancer"
    name = "certbot"
}

resource "oci_identity_user_capabilities_management" "storage_user" {
    user_id = oci_identity_user.storage_user.id

    can_use_api_keys             = "true"
    can_use_auth_tokens          = "false"
    can_use_console_password     = "false"
    can_use_customer_secret_keys = "true"
    can_use_smtp_credentials     = "false"
}

resource "oci_identity_user_capabilities_management" "lb_user" {
    user_id = oci_identity_user.lb_user.id

    can_use_api_keys             = "true"
    can_use_auth_tokens          = "false"
    can_use_console_password     = "false"
    can_use_customer_secret_keys = "false"
    can_use_smtp_credentials     = "false"
}

resource "oci_identity_customer_secret_key" "storage_user" {
    display_name = "django-key"
    user_id = oci_identity_user.storage_user.id
}

resource "oci_identity_user_group_membership" "storage_users" {
    group_id = oci_identity_group.storage_users.id
    user_id = oci_identity_user.storage_user.id
}

resource "oci_identity_user_group_membership" "lb_users" {
    group_id = oci_identity_group.lb_users.id
    user_id = oci_identity_user.lb_user.id
}
