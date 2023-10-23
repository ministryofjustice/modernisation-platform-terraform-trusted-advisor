package main

import (
	awsSDK "github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/lambda"
	"github.com/gruntwork-io/terratest/modules/aws"
	"github.com/gruntwork-io/terratest/modules/random"
	"github.com/gruntwork-io/terratest/modules/terraform"
	test_structure "github.com/gruntwork-io/terratest/modules/test-structure"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestLamdaFunctionRuns(t *testing.T) {
	t.Parallel()
	uniqueId := random.UniqueId()
	terraformDir := test_structure.CopyTerraformFolderToTemp(t, "..", "test/unit-test")
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

	lambdaClient := aws.NewLambdaClient(t, "us-west-2")
	function, _ := lambdaClient.GetFunction(&lambda.GetFunctionInput{
		FunctionName: &lambdaFunctionName,
	})

	assert.Equal(t, lambdaFunctionName, awsSDK.StringValue(function.Configuration.FunctionName))
}
