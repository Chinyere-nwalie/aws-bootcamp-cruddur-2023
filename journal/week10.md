# Week 10 — CloudFormation Part 1

For ECS CloudFormation templates[Link](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/quickref-ecs.html)

In case you want to convert an already provisioned resource to the was cloud formation stack with the current configuration use [this](https://former2.com/) or try this [link](https://github.com/sentialabs/cloudformer2) [link](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/validate-template.html)

``sh
aws cloudformation describe-change-set --change-set-name arn:aws:cloudformation:us-east-1:454949276804:changeSet/awscli-cloudformation-package-deploy-1698421599/d6a53456-c98a-4e9c-a378-2eec2aff9ebd
``
Run
``sh
aws cloudformation validate-template --template-body file:///workspace/aws-bootcamp-cruddur-2023/aws/cfn/template.yaml
``
output was

``sh
{
    "Parameters": [],
    "Description": "Setup ECS Cluster\n"
}
``
