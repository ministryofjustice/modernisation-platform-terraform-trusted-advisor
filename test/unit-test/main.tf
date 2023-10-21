module "module_test" {
  source        = "../../"
  tags          = local.tags
  name          = var.name
  iam_role_name = var.iam_role_name
}
