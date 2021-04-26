# based on https://github.com/marcelo-ochoa/oci-swarm-cluster

resource "oci_load_balancer_load_balancer" "balancer" {
  compartment_id = var.compartment_ocid
  display_name   = "balancer"
  shape          = "flexible"
  subnet_ids     = [oci_core_subnet.main_subnet.id]
  is_private     = "false"
  shape_details {
    maximum_bandwidth_in_mbps = 10
    minimum_bandwidth_in_mbps = 10
  }
}

resource "oci_load_balancer_backend_set" "balancer_backend_set" {
  name             = "balancer_backend_set"
  load_balancer_id = oci_load_balancer_load_balancer.balancer.id
  policy           = "IP_HASH"

  health_checker {
    port                = "30080"
    protocol            = "HTTP"
    response_body_regex = ".*"
    url_path            = "/health/"
    return_code         = 200
    interval_ms         = 5000
    timeout_in_millis   = 2000
    retries             = 10
  }
}

resource "oci_load_balancer_backend" "balancer_backends" {
  load_balancer_id = oci_load_balancer_load_balancer.balancer.id
  backendset_name  = oci_load_balancer_backend_set.balancer_backend_set.name
  ip_address       = element(
    oci_core_instance.compute_instances.*.private_ip, count.index
  )
  port             = 30080
  backup           = "false"
  drain            = "false"
  offline          = "false"
  weight           = 1

  count = 2
}

resource "oci_load_balancer_listener" "balancer_listener_80" {
  load_balancer_id         = oci_load_balancer_load_balancer.balancer.id
  default_backend_set_name = oci_load_balancer_backend_set.balancer_backend_set.name
  name                     = "balancer_listener-80"
  port                     = 80
  protocol                 = "HTTP"

  connection_configuration {
    idle_timeout_in_seconds = "30"
  }
}

resource "oci_load_balancer_listener" "balancer_listener_443" {
  load_balancer_id         = oci_load_balancer_load_balancer.balancer.id
  default_backend_set_name = oci_load_balancer_backend_set.balancer_backend_set.name
  name                     = "balancer_listener-443"
  port                     = 443
  protocol                 = "HTTP"

  connection_configuration {
    idle_timeout_in_seconds = "60"
  }
}
