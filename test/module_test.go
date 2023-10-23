package main

import (
	awsSDK "github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/lambda"
	"github.com/gruntwork-io/terratest/modules/aws"
	"github.com/gruntwork-io/terratest/modules/random"
	"github.com/gruntwork-io/terratest/modules/terraform"
	testStructure "github.com/gruntwork-io/terratest/modules/test-structure"
	"github.com/stretchr/testify/assert"
	"regexp"
	"testing"
)

func TestModuleOutputs(t *testing.T) {
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
	lambdaFunctionInvokeArn := terraform.Output(t, terraformOptions, "lambda_function_invoke_arn")
	lambdaFunctionArn := terraform.Output(t, terraformOptions, "lambda_function_arn")

	assert.Regexp(t, regexp.MustCompile(`^`+name), lambdaFunctionName)
	assert.Regexp(t, regexp.MustCompile(`(arn:(aws[a-zA-Z-]*)?:lambda:)?([a-z]{2}(-gov)?-[a-z]+-\d{1}:)?(\d{12}:)?(function:)?([a-zA-Z0-9-_\.]+)(:(\$LATEST|`+name+`))?`), lambdaFunctionInvokeArn)
	assert.Regexp(t, regexp.MustCompile(`(arn:(aws[a-zA-Z-]*)?:lambda:)?([a-z]{2}(-gov)?-[a-z]+-\d{1}:)?(\d{12}:)?(function:)?([a-zA-Z0-9-_\.]+)(:(\$LATEST|`+name+`))?`), lambdaFunctionArn)
}

func TestLamdaFunctionIsCreated(t *testing.T) {
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

	lambdaClient := aws.NewLambdaClient(t, "eu-west-2")
	function, _ := lambdaClient.GetFunction(&lambda.GetFunctionInput{
		FunctionName: &lambdaFunctionName,
	})

	assert.Equal(t, lambdaFunctionName, awsSDK.StringValue(function.Configuration.FunctionName))
}

func TestLamdaFunctionThrows403WhenInvokedWithoutPermissions(t *testing.T) {
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

	var invocationType aws.InvocationTypeOption = aws.InvocationTypeDryRun
	input := &aws.LambdaOptions{InvocationType: &invocationType}
	out := aws.InvokeFunctionWithParams(t, "eu-west-2", lambdaFunctionName, input)

	assert.Equal(t, int(*out.StatusCode), 403)
}

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
