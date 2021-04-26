# based on https://github.com/marcelo-ochoa/oci-swarm-cluster

resource "oci_core_virtual_network" "main_vcn" {
  cidr_block     = lookup(var.network_cidrs, "MAIN-VCN-CIDR")
  compartment_id = var.compartment_ocid
  display_name   = "main_vcn"
  dns_label      = "main"
}

resource "oci_core_subnet" "main_subnet" {
  cidr_block                 = lookup(var.network_cidrs, "MAIN-SUBNET-REGIONAL-CIDR")
  display_name               = "main_subnet"
  dns_label                  = "main"
  security_list_ids          = [oci_core_security_list.security_list.id]
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_virtual_network.main_vcn.id
  route_table_id             = oci_core_route_table.main_route_table.id
  dhcp_options_id            = oci_core_virtual_network.main_vcn.default_dhcp_options_id
  prohibit_public_ip_on_vnic = "false"
}

resource "oci_core_subnet" "lb_subnet" {
  cidr_block                 = lookup(var.network_cidrs, "MAIN-LB-SUBNET-REGIONAL-CIDR")
  display_name               = "lb_subnet"
  dns_label                  = "lb"
  security_list_ids          = [oci_core_security_list.lb_security_list.id]
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_virtual_network.main_vcn.id
  route_table_id             = oci_core_route_table.lb_route_table.id
  dhcp_options_id            = oci_core_virtual_network.main_vcn.default_dhcp_options_id
  prohibit_public_ip_on_vnic = "false"
}

resource "oci_core_route_table" "main_route_table" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_virtual_network.main_vcn.id
  display_name   = "main_route_table"

  route_rules {
    destination       = lookup(var.network_cidrs, "ALL-CIDR")
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.internet_gateway.id
  }
}

resource "oci_core_route_table" "lb_route_table" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_virtual_network.main_vcn.id
  display_name   = "lb_route_table"

  route_rules {
    destination       = lookup(var.network_cidrs, "ALL-CIDR")
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.internet_gateway.id
  }
}

resource "oci_core_internet_gateway" "internet_gateway" {
  compartment_id = var.compartment_ocid
  display_name   = "internet_gateway"
  vcn_id         = oci_core_virtual_network.main_vcn.id
}
