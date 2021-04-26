# based on https://github.com/marcelo-ochoa/oci-swarm-cluster

variable "tenancy_ocid" {}
variable "compartment_ocid" {}

variable "user_ocid" {}
variable "fingerprint" {}
variable "private_key_path" {}


variable "region" { default = "uk-london-1" }

variable "db_names" {
  type = list(string)
}

variable "db_version" {
  default = "21c"
}

variable "compute_name" {}

variable "compute_image_id" {
    default = "ocid1.image.oc1.uk-london-1.aaaaaaaa7vf2q5jtvzmniylmssuyrczkxw64wl4mlat4kh2fprquuosgficq"
}

variable "public_ssh_key" {}

variable "network_cidrs" {
  type = map(string)

  default = {
    MAIN-VCN-CIDR                = "10.1.0.0/16"
    MAIN-SUBNET-REGIONAL-CIDR    = "10.1.21.0/24"
    MAIN-LB-SUBNET-REGIONAL-CIDR = "10.1.22.0/24"
    LB-VCN-CIDR                  = "10.2.0.0/16"
    LB-SUBNET-REGIONAL-CIDR      = "10.2.22.0/24"
    ALL-CIDR                     = "0.0.0.0/0"
  }
}
