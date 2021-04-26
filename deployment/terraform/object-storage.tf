# based on https://github.com/marcelo-ochoa/oci-swarm-cluster

data "oci_objectstorage_namespace" "user_namespace" {
  compartment_id = var.compartment_ocid
}

resource "oci_objectstorage_bucket" "crawled" {
  access_type    = "NoPublicAccess"
  compartment_id = var.compartment_ocid
  name                  = "crawled"
  namespace             = data.oci_objectstorage_namespace.user_namespace.namespace
  object_events_enabled = "false"
  storage_tier          = "Standard"
  versioning            = "Disabled"
}

resource "oci_objectstorage_bucket" "securities" {
  access_type    = "NoPublicAccess"
  compartment_id = var.compartment_ocid
  name                  = "securities"
  namespace             = data.oci_objectstorage_namespace.user_namespace.namespace
  object_events_enabled = "false"
  storage_tier          = "Standard"
  versioning            = "Disabled"
}
