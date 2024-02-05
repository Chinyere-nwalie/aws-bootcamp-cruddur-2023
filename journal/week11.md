# Week 11:

### CloudFormation Part 2 Tasks
- [CFN MachineUser Stack](#cfn-machineuser-stack)


### CFN MachineUser Stack

1. **Create MachineUser Template**

```sh
cd /workspace/aws-bootcamp-cruddur-2023
mkdir -p  aws/cfn/machine-user
cd aws/cfn/machine-user
touch template.yaml config.toml
```

2. Update `aws/cfn/machine-user/template.yaml` with the following code.

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Resources:
  CruddurMachineUser:
    Type: "AWS::IAM::User"
    Properties:
      UserName: "cruddur_machine_user"
  DynamoDBFullAccessPolicy:
    Type: "AWS::IAM::Policy"
    Properties:
      PolicyName: "DynamoDBFullAccessPolicy"
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Action:
              - dynamodb:PutItem
              - dynamodb:GetItem
              - dynamodb:Scan
              - dynamodb:Query
              - dynamodb:UpdateItem
              - dynamodb:DeleteItem
              - dynamodb:BatchWriteItem
            Resource: "*"
      Users:
        - !Ref CruddurMachineUser
```

Update config.toml with the following changing `bucket` and `region` as appropriate

```config
[deploy]
bucket = 'cfn-tajarba-artifacts'
region = 'eu-west-2'
stack_name = 'CrdMachineUser'
```

3. Modify the script to allow access from GitPod

Similar to the `update-sg-rule` script used to allow access to the RDS database I created a script that will automatically update the `CrdDbRDSSG` security group with our GitPod IP. I then included this in both my `.gitpod.yml` and `./bin/bootstrap` script.

```sh
#! /usr/bin/bash

CYAN='\033[1;36m'
NO_COLOR='\033[0m'
LABEL="ddb-update-sg-rule"
printf "${CYAN}== ${LABEL}${NO_COLOR}\n"


SG_GROUP_NAME="CrdDbRDSSG"
GITPOD_IP=$(curl ifconfig.me)
echo $GITPOD_IP

# aws ec2 describe-vpcs --filters "Name=tag:Name,Values=CrdNetVPC"
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=CrdNetVPC" --query 'Vpcs[*].VpcId' --output text) 
echo $VPC_ID

# As the Security group is not in the default VPC we need to filter on both the VPC_ID and Security Group Name
DB_SG_ID=$(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$VPC_ID" "Name=group-name,Values=$SG_GROUP_NAME" --query 'SecurityGroups[*].GroupId' --output text)
echo $DB_SG_ID

# For now this is hard coded but figure a way to automate this
DB_SG_RULE_ID="sgr-099f9e3d8c8c1327e"

aws ec2 modify-security-group-rules \
    --group-id $DB_SG_ID \
 --security-group-rules "SecurityGroupRuleId=$DB_SG_RULE_ID,SecurityGroupRule={Description=GitPOD,IpProtocol=tcp,FromPort=5432,ToPort=5432,CidrIpv4=$GITPOD_IP/32}"
```

4. **Create MachineUser Deploy Script**

```sh
cd /workspace/aws-bootcamp-cruddur-2023
mkdir -p  bin/cfn
cd bin/cfn
touch machineuser-deploy
chmod u+x machineuser-deploy
```

5. Update the script with the following [code](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/bin/cfn/machineuser)

Running `./bin/cfn/machineuser-deploy` now initiates a changeset for the CFN stack.

> Week X  [Final-Week](week12.md)
