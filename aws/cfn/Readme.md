## Architecture Guide

Before you run any templates, be sure to create an S3 bucket to contain
all of our artifactsnfor CloudFormation.

```
aws s3 mk s3://nwaliechinyere-cfn-artifacts
export CFN_BUCKET="nwaliechinyere-cfn-artifacts"
gp env CFN_BUCKET="nwaliechinyere-cfn-artifacts"
```
> To confirm your env vars run 'env | grep'
> Remember bucket names are unique to the provid code example you may need to adjust