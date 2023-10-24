package main

import (
	"github.com/aws/aws-sdk-go/service/lambda"
	"github.com/gruntwork-io/terratest/modules/aws"
	"github.com/gruntwork-io/terratest/modules/random"
	"github.com/gruntwork-io/terratest/modules/terraform"
	testStructure "github.com/gruntwork-io/terratest/modules/test-structure"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestLamdaFunctionThrows204WhenCalledWithCreatedIAMRole(t *testing.T) {
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

	lambdaFunctionName := terraform.Output(t, terraformOptions, "lambda_function_name")
	iamRoleARN := terraform.Output(t, terraformOptions, "iam_role_arn")

	session, _ := aws.CreateAwsSessionFromRole("eu-west-2", iamRoleARN)
	lambdaClient := lambda.New(session)
	out, _ := lambdaClient.Invoke(&lambda.InvokeInput{FunctionName: &lambdaFunctionName, Payload: nil})

	assert.Equal(t, int(*out.StatusCode), 204)
}
