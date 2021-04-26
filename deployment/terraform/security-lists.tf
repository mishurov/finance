# based on https://github.com/marcelo-ochoa/oci-swarm-cluster

data "oci_core_services" "all_services" {
  filter {
    name   = "name"
    values = ["All .* Services In Oracle Services Network"]
    regex  = "true"
  }
}

resource "oci_core_security_list" "security_list" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_virtual_network.main_vcn.id
  display_name   = "main"

  ingress_security_rules {
    protocol  = local.all_protocols
    source    = lookup(var.network_cidrs, "MAIN-SUBNET-REGIONAL-CIDR")
    stateless = "true"
  }

  ingress_security_rules {
    protocol = local.tcp_protocol_number
    source   = lookup(var.network_cidrs, "ALL-CIDR")

    tcp_options {
      max = local.http_port_number
      min = local.http_port_number
    }
  }

  ingress_security_rules {
    protocol = local.tcp_protocol_number
    source   = lookup(var.network_cidrs, "ALL-CIDR")

    tcp_options {
      max = local.ssh_port_number
      min = local.ssh_port_number
    }
  }

  ingress_security_rules {
    protocol = local.tcp_protocol_number
    source   = lookup(var.network_cidrs, "ALL-CIDR")

    tcp_options {
      max = local.https_port_number
      min = local.https_port_number
    }
  }

  egress_security_rules {
    protocol    = local.all_protocols
    destination = lookup(var.network_cidrs, "MAIN-SUBNET-REGIONAL-CIDR")
    stateless   = "true"
  }

  egress_security_rules {
    protocol    = local.all_protocols
    destination = lookup(var.network_cidrs, "ALL-CIDR")
  }

  egress_security_rules {
    protocol         = local.all_protocols
    destination      = lookup(
        data.oci_core_services.all_services.services[0], "cidr_block"
    )
    destination_type = "SERVICE_CIDR_BLOCK"
  }
}

resource "oci_core_security_list" "lb_security_list" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_virtual_network.main_vcn.id
  display_name   = "lb_security_list"

  ingress_security_rules {
    protocol  = local.all_protocols
    source    = lookup(var.network_cidrs, "ALL-CIDR")
    stateless = "true"
  }

  ingress_security_rules {
    protocol = local.tcp_protocol_number
    source   = lookup(var.network_cidrs, "ALL-CIDR")

    tcp_options {
      max = local.http_port_number
      min = local.http_port_number
    }
  }

  ingress_security_rules {
    protocol = local.tcp_protocol_number
    source   = lookup(var.network_cidrs, "ALL-CIDR")

    tcp_options {
      max = local.https_port_number
      min = local.https_port_number
    }
  }

  egress_security_rules {
    protocol    = local.all_protocols
    destination = lookup(var.network_cidrs, "ALL-CIDR")
    stateless   = "true"
  }

  egress_security_rules {
    protocol    = local.tcp_protocol_number
    destination = lookup(var.network_cidrs, "MAIN-SUBNET-REGIONAL-CIDR")

    tcp_options {
      max = local.microservices_port_number
      min = local.microservices_port_number
    }
  }
}

locals {
  http_port_number          = "80"
  https_port_number         = "443"
  microservices_port_number = "80"
  ssh_port_number           = "22"
  tcp_protocol_number       = "6"
  all_protocols             = "all"
}
