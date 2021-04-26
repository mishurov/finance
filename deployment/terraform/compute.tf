# based on https://github.com/marcelo-ochoa/oci-swarm-cluster

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

data "oci_limits_services" "compute_services" {
  compartment_id = var.tenancy_ocid

  filter {
    name   = "name"
    values = ["compute"]
  }
}

data "oci_limits_limit_definitions" "limits" {
  compartment_id = var.tenancy_ocid
  service_name   = data.oci_limits_services.compute_services.services.0.name

  filter {
    name   = "description"
    values = ["VM.Standard.E2.1.Micro"]
  }
}

data "oci_limits_resource_availability" "compute" {
  compartment_id      = var.tenancy_ocid
  limit_name          = data.oci_limits_limit_definitions.limits.limit_definitions[0].name
  service_name        = data.oci_limits_services.compute_services.services.0.name
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[count.index].name


  count = length(data.oci_identity_availability_domains.ads.availability_domains)
}

resource "random_shuffle" "ad" {
  input        = local.compute_available_limit_ad_list
  result_count = length(local.compute_available_limit_ad_list)
}

locals {
  compute_available_limit_ad_list = [
    for limit in data.oci_limits_resource_availability.compute :
    limit.availability_domain if (limit.available - 2) >= 0]
}


resource "oci_core_instance" "compute_instances" {
  lifecycle {
    ignore_changes = [
        availability_domain,
    ]
  }

  compartment_id      = var.compartment_ocid

  availability_domain = random_shuffle.ad.result_count > 0 ? random_shuffle.ad.result[
    count.index % length(random_shuffle.ad.result)
  ] : false

  display_name        = "${var.compute_name}${count.index}"
  shape               = "VM.Standard.E2.1.Micro"

  create_vnic_details {
    subnet_id        = oci_core_subnet.main_subnet.id
    display_name     = "primaryvnic"
    assign_public_ip = true
    hostname_label   = "${var.compute_name}${count.index}"
  }

  source_details {
    source_type = "image"
    source_id   = var.compute_image_id
  }

  metadata = {
    ssh_authorized_keys = var.public_ssh_key
  }

  count = 2
}
