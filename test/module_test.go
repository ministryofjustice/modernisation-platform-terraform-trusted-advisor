package main

import (
	"github.com/gruntwork-io/terratest/modules/random"
	"github.com/gruntwork-io/terratest/modules/terraform"
	testStructure "github.com/gruntwork-io/terratest/modules/test-structure"
	"testing"
)

func TestApply(t *testing.T) {
	t.Parallel()
	uniqueId := random.UniqueId()
	terraformDir := testStructure.CopyTerraformFolderToTemp(t, "..", "test/unit-test")
	name := "testing-trusted-advisor-refresh-" + uniqueId
	iamRoleName := "testing-AWSTrustedAdvisorRefresh-" + uniqueId
	terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
		TerraformDir: terraformDir,
		Vars: map[string]interface{}{
			"name":          name,
			"iam_role_name": iamRoleName,
		},
	})

	defer terraform.Destroy(t, terraformOptions)
	terraform.InitAndApply(t, terraformOptions)
}
