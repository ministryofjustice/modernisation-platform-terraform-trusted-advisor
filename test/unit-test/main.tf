resource "random_id" "name" {
  byte_length = 8
}

module "module_test" {
  source    = "../../"
  tags      = local.tags
  name      = "testing-trusted-advisor-refresh-${random_id.name.id}"
  role_name = "testing-AWSTrustedAdvisorRefresh-${random_id.name.id}"
}
