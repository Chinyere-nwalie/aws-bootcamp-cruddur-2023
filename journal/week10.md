# Week 10 — CloudFormation Part 1

 This week we'll be doing rigorous tasks, For weeks 10 & 11, we will focus more on Infrastructure as Code to provision and manage the main components of our Cruddur app with designs to complete the BootCamp. The app completion manages updates to the application consistently and enables deployment process automation when needed.

## CloudFormation Part 1 Tasks
- [AWS CloudFormation](#aws-cloudformation)
  - [Cost](#cost)
  - [Security](#Security)
  - [Prerequisite for Our Task ](#prerequisite-for-our-task )
- [AWS CloudFormation — Policy As Code](#AWS-cloudformation-policy-as-code)
  - [CFN Guard](#cfn-guard)
  - [CFN Validate](#cfn-validate)
  - [CFN Lint](#cfn-lint)
  - [TOML Config ](#toml-and-config-management)
  - [Setting Up CFN Artifact Bucket](#setting-up-cfn-artifact-bucket)
- [AWS CFN Stack Prerequisite information](#aws-cfn-stack-prerequisite-information)
  - [Networking Layer](#cfn-network-layer)
  - [Cluster Template](#cluster-template)
  - [AWS CFN RDS STACK](#aws-cfn-rds-stack)
  - [CFN Service Deploy Stack](#cfn-service-deploy-stack)

--- 

### AWS CloudFormation?

AWS CFN  is a service and an IaC tool provided by AWS that helps you model and set up your AWS resources so that you can spend less time managing those resources and more time focusing on your applications that run in AWS, It also allows you to define and provision your cloud infrastructure using templates in JSON or **YAML** format. These templates show and explain the desired state, including resources, configurations, and dependencies in codes, and you don't need to individually create and configure AWS resources and figure out what's dependent on what, AWS CloudFormation handles that.

## Cost
In AWS Cloudformation, you only pay for what you use, with no minimum fees and no required upfront commitment. When you deploy a stack extension with AWS Cloudformation, you incur charges per stack operation.
Stack operations are: `CREATE`, `UPDATE`, `DELETE`, `READ`, or `LIST` actions on a resource type and `CREATE`, `UPDATE`, or `DELETE` actions for Hook type.

## Security

**Amazon Side** - Security Best Practice
- Compliance standard is what your business requires from IaC (Infrastructure as a code) service and is available in the region you need to operate
- Amazon Organization SCP (Service control policies) - restrict action are; (create, delete, modify) on production template/resource.
- AWS Cloudtrail is enabled & monitored to trigger alerts for malicious activity.
- AWS Audit Manager, IAM Access Analyzer

**Application Side** - Security Best Practice

- Use the linting to avoid hardcoded secrets and fix indentation
- Use cfn-init to update an existing file, it creates a backup copy of the original file in the same directory
- IAM (Identity and Access Management) to control who can access the CFN template
- Security in and of the cloud formation configuration access
- Security of the cloud formation entry point.
- Develop a process for continuously verifying if there is a change that may break the CICD pipeline
-  Reference podcasts from our security instructor [Ashish Security Podcast](https://cloudsecuritypodcast.tv/listen-to-the-episodes/)

---

**CloudFormation Insights**
CloudFormation is handled differently than IaC tools like Terraform and Ansible, the key differences are below.

|          | CloudFormation                         | Terraform                                 | Ansible                                   |
|----------|----------------------------------------|-------------------------------------------|-------------------------------------------|
| State    | Managed internally by AWS               | Local state file                          | No explicit state file                     |
| Approach | Immutable infrastructure                | Mutable infrastructure                    | Idempotent execution                       |
| Stacks   | Yes                                    | No                                        | No                                        |

---

###  Prerequisite for Our Task 

How provisioning of a Cluster works.

![AWS CFN cluster](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/CFN%20Cluster.jpeg)


1.  Create a file in a given directory with the name `template.yaml`
    - Specify the header for `AWSTemplateFormatVersion` and add `Description`

```YAML
  AWSTemplateFormatVersion: '2010-09-09'
  Description: ECS Fargate Cluster
```

2. Define the resources you want to create using AWS, we used **ECS Cluster**:
```YAML
Resources:
  ECSCluster: #LogicalName
    Type: 'AWS::ECS::Cluster'
```

3. Specify any additional configurations needed e.g. security groups, IAM roles.
    - Create a Bucket for the template artifact
```sh
aws s3 mb s3://cfn-artifacts
```

4. Set your environement variables for `$STACK_NAME`, `$BUCKET` and your AWS `$REGION` e.g.
```
export BUCKET="cfn-artifacts"
export CFN_PATH="<path-to-ur-template>"
```

5.  Authenticate and [deploy]([(https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/bin/cfn/cluster)]) using AWS CLI.
```sh
aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --s3-bucket $BUCKET \
  --s3-prefix cluster \
  --region $REGION \
  --template-file "$CFN_PATH" \
  --no-execute-changeset \
  --tags group=best-cluster \
  --parameter-overrides $PARAMETERS \
```

6. Proceed to the AWS Management Console and manually execute the changeset to initiate the provisioning of the infrastructure.

![CFN-Week-10](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(633).png)

![CFN-Week-10](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(634).png)

![CFN-Week-10](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(635).png)

![CFN-Week-10](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(636).png)

![CFN-Week-10](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(637).png)

![CFN-Week-10](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(643).png)

![CFN-Week-10](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(644).png)

![CFN-Week-10](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(645).png)

![CFN-Week-10](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(646).png)

![CFN-Week-10](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(648).png)

![CFN-Week-10](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(639).png)

![CFN-Week-10](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(640).png)

![CFN-Week-10](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(641).png)

![CFN-Week-10](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(642).png)

Note: 
- The `--no-execute-changeset` will validate the code but not execute it.
- Once you run the command, the CLI will create a script to check the outcome, and afterward check it on the cloud formation via the console.
- Changeset in the console is useful to understand the behavior of the change and to see if there is a difference in your infrastructure (i.e. a critical database run in production. By seeing the changeset you know if the resource will be removed). check also the Update requires voice in the [documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ecs-service.html)
- check the tab `replacement` if it is `true`. this helps to see if one part of the stack will be replaced.

---

##  AWS CloudFormation — Policy As Code 

[AWS CFN](https://docs.aws.amazon.com/cfn-guard/latest/ug/what-is-guard.html) is a policy-as-code evaluation tool that manages policies in the form of code. In CFN, it is important to add compliance and PaC, this helps ensure that the deployed infrastructure works in line with the organization's policies and standards. 

---

## CFN Guard

CFN Guard allows us to define custom rules and policies that are enforced during the CloudFormation stack deployment process. This ensures that our infrastructure deployments complies with **security**, **compliance**, and **governance** requirements.

To get started with CFN Guard for validating your (CFN) templates, follow these steps:

1.  First run this to generated a guard DSL template for version 2.0
```sh
cfn-guard rulegen --template /workspace/aws-bootcamp-cruddur-2023/aws/cfn/template.yaml
```
> output
```sh
let aws_ecs_cluster_resources = Resources.*[ Type == 'AWS::ECS::Cluster' ]
rule aws_ecs_cluster when %aws_ecs_cluster_resources !empty {
  %aws_ecs_cluster_resources.Properties.ClusterName == "MyCluster"
  %aws_ecs_cluster_resources.Properties.CapacityProviders == ["FARGATE"]
}
```

2.  Install cfn-guard
```sh
install cfn-guard
```
3. verify that CFN Guard is successfully installed by running the command
```sh
 cfn-guard --version
```
 > If successful, the similar output should be shown as ``cfn-guard 2.1.3``

4. Create  `task-definition.guard` for our cluster.

![image](assets/week10/cfn guard.png)

5. The generated file in [my ecs guard folder](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/aws/cfn/ecs-cluster.guard).
   
6. Validate the CFN template 
```sh
 cfn-guard validate
```
---

## CFN validate
This tool helps prevent common security risks that could affect your infrastructure. Ensuring the templates are well-written and follow the recommended CloudFormation syntax, reducing vulnerabilities or misconfigurations.

To validate a **CloudFormation template**, use the below command example
```sh
aws cloudformation validate-template --template-body <value> [--template-url <value>]
```
- `--template-body` or `-t`: Specifies the CloudFormation template to validate, either as a string or a file path. You must provide either `--template-body` or `--template-url`.
- `--template-url`: The URL of the CloudFormation template to validate, you must provide either `--template-body` or `--template-url`.

**Run --**

```sh
aws cloudformation validate-template --template-body file:///workspace/aws-bootcamp-cruddur-2023/aws/cfn/template.yaml
```
The output was

```sh
aws cloudformation describe-change-set --change-set-name arn:aws:cloudformation:us-east-1:454949276804:changeSet/awscli-cloudformation-package-deploy-1698421599/d6a53456-c98a-4e9c-a378-2eec2aff9ebd
```

```sh
{
    "Parameters": [],
    "Description": "Setup ECS Cluster\n"
}
```
![aws-cluster-deploy-cli](assets/week10/aws-cluster-deploy-cli.png)

The important aspect of working with CFN requires a deep understanding of infrastructure as code (IaC) principles, and writing templates.

> Another potential tool to validate your CFN is [taskcat](https://github.com/aws-ia/taskcat)


## CFN Lint

Cfn-lint is a tool that provides linting capabilities for CFN templates to identify and address potential issues, errors, and security risks.

Integrating cfn-lint into your preferred IDE (Integrated developement environment), you must first install it using this command
```sh
pip install cfn-lint
```

To run lint, execute the command below to know your CFN template path
```sh
cfn-lint <path-to-template> 
```

### TOML and Config Management
Another thing that you may deploy is the TOML, this is a config language built for storing configuration and data files.

- Make sure you have `Ruby` and install `TOML` from `Gem`
```rb
gem install cfn-toml
```

**HINTS:** You can run these commands `cfn-lint`, `cfn-guard`, `cfn-toml` for the installation in your Gitpod environment.

![](assets/week10/diagram.png)

---

### Setting Up CFN Artifact Bucket

As shown in the stack architecture diagram, CFN artifacts will be stored in a bucket.

Follow these steps to do so:

1. Create an S3 bucket named `cfn-artifacts-bucket` for the CFN artifact. This bucket will be used for all future templates.

```rb
aws s3 mb s3://cfn-artifact-bucket
```
2. Save the bucket name in your IDE for effective purposes example is below.

```cfn
export CFN_BUCKET="cfn-artifacts-bucket"
gp env CFN_BUCKET="cfn-artifacts-bucket"
```

We can now reference the bucket name in the scripts and get the artifacts on deployments in AWS.

![My CFN Artifacts bucket in s3](assets/week10/network/CFN Artifactsbucket in s3.png)

> Bucket names are globally unique, *please personalize the bucket name as yours*

---

### AWS CFN Stack Prerequisite Information

Below are more detailed descriptions on our Cruddur App main component's

**Networking**
- Virtual Private Cloud (VPC): A dedicated VPC is essential using CloudFormation, providing isolated network resources for the application.
- Ensuring the right CIDR (Classless Inter-Domain Routing) block size is vital, [use this tool](https://cidr.xyz/) to select an appropriate CIDR block.
- Public Subnet: Within the VPC, a public subnet is created, allowing external access to the application.
- Availability Zones: The architecture spans across multiple availability zones to enhance fault tolerance and ensure high availability.

**Cluster**
- Deployment: The cluster template is utilized to deploy a cluster, using the VPC ID and Public Subnet from the Networking exports.
- Cluster: Essential information such as the VPC ID, Service Security Group ID, and Target Groups are included in the Cluster templates.

**Frontend**
- Integration: The Frontend template integrates with the cluster's Frontend Target Group, using CloudFront for improved content delivery and scalability.

**Backend Services**
- Secure Communication: The Backend Services make use of the Cluster templates; 'VPC ID' to ensure secure communication within the VPC.
- Databases: An RDS database instance is included in the Backend Services for dealing with cruds and Dynamodb for dealing with messages and tables.

**CI/CD**
- Integration: Provision CodePipelines, and CodeBuild and configure the buildspec all using code.

### CFN Network Stack

This CloudFormation template is designed to create foundational networking components for the app stack and assure cloud connectivity.

[Diagramming](assets/week10/diagramming.png)

Cruddur network resources include the following:

| Resource        | Description                                                                                                              |
|------------------:|--------------------------------------------------------------------------------------------------------------------------|
| `VPC`              | Configures VPC with specified CIDR block and enables DNS hostnames for EC2 instances allows traffic only from IPv4 and disables IPv6. |
| `InternetGateway`  | Creates an Internet Gateway resource.                                                                                     |
| `RouteTable`      | Sets up a route table that enables routing to the Internet Gateway and local resources. It includes routes to the Internet Gateway and local destinations.                        |
| `Subnets`          | Creates six subnets, each associated explicitly with the route table. There are three public subnets (numbered 1 to 3) and three private subnets (numbered 1 to 3).       |

Writing the  `template.yaml` file for Networking stack.

```YAML
AWSTemplateFormatVersion: 2010-09-09
Description: |
This CloudFormation template is essential in the networking components of your stack, ensuring a strong foundation. 

It includes the following key components
  - VPC
    - configures DNS hostnames for EC2 instances
    - only allows2 traffic from IPV4, IPV6 is disabled
  - InternetGateway
  - Route Table that enables routing to the InternetGateway and local resources
    - route to the IGW
    - route to Local
  - Six subnets, each explicitly associated with the Route Table:
    - 3 Public Subnets numbered 1 to 3
    - 3 Private Subnets numbered 1 to 3
```

**MY YAML FILE**

```YAML
 VpcCidrBlock:
    Type: String
    Default: 10.0.0.0/16
  Az1:
    Type: AWS::EC2::AvailabilityZone::Name
    Default: us-east-1a
  SubnetCidrBlocks: 
    Description: "Comma-delimited list of CIDR blocks for our private public subnets"
    Type: CommaDelimitedList
    Default: >
      10.0.0.0/24, 
      10.0.4.0/24, 
      10.0.8.0/24, 
      10.0.12.0/24,
      10.0.16.0/24,
      10.0.20.0/24
  Az2:
    Type: AWS::EC2::AvailabilityZone::Name
    Default: us-east-1b
  Az3:
    Type: AWS::EC2::AvailabilityZone::Name
    Default: us-east-1c
```

**Creating the Networking Deploy Script**

```YAML
#! /usr/bin/env bash
set -e # stop the execution of the script if it fails

CYAN='\033[1;36m'
NO_COLOR='\033[0m'
LABEL="CFN_NETWORK_DEPLOY"
printf "${CYAN}====== ${LABEL}${NO_COLOR}\n"

# Get the absolute path of this script
ABS_PATH=$(readlink -f "$0")
CFN_BIN_PATH=$(dirname $ABS_PATH)
BIN_PATH=$(dirname $CFN_BIN_PATH)
PROJECT_PATH=$(dirname $BIN_PATH)
CFN_PATH="$PROJECT_PATH/aws/cfn/networking/template.yaml"
CONFIG_PATH="$PROJECT_PATH/aws/cfn/networking/config.toml"

cfn-lint $CFN_PATH

BUCKET=$(cfn-toml key deploy.bucket -t $CONFIG_PATH)
REGION=$(cfn-toml key deploy.region -t $CONFIG_PATH)
STACK_NAME=$(cfn-toml key deploy.stack_name -t $CONFIG_PATH)

aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --s3-bucket $BUCKET \
  --s3-prefix networking \
  --region $REGION \
  --template-file "$CFN_PATH" \
  --no-execute-changeset \
  --tags group=cruddur-networking \
  --capabilities CAPABILITY_NAMED_IAM
```
I modified the script to not have hardcoded values as I am using my local environment so when I spin up my container it doesn't error out in my GitPod workspace.

 > I always run `./bin/cfn/networking-deploy` to initiate a new changeset for the CFN stack when being modified.

**Networking Template Components**

- `VpcCidrBlock`: Specifies the CIDR block for the VPC. The default value is `10.0.0.0/16`.
- `Az1`: Defines the Availability Zone for the first subnet. The default value is `us-east-1a`.
- `SubnetCidrBlocks`: Comma-delimited list of CIDR blocks for the private and public subnets. Please provide the CIDR blocks for all six subnets. Example: `10.0.0.0/24, 10.0.4.0/24, 10.0.8.0/24, 10.0.12.0/24, 10.0.16.0/24, 10.0.20.0/24`.
- `Az2`: Defines the Availability Zone for the second subnet. The default value is `us-east-1b`.
- `Az3`: Defines the Availability Zone for the third subnet. The default value is `us-east-1c`.

**Virtual Private Cloud**

The VPC  is an entirely different section in the AWS cloud where you launch AWS resources, It serves as the foundational networking component for the Cruddur app architecture, providing the network environment for all the other resources.

- **Type**: `AWS::EC2::VPC`
- **Properties**:
  - `CidrBlock`: Specifies the CIDR block for the VPC. You can reference the parameter `VpcCidrBlock`.
  - `EnableDnsHostnames`: Enables DNS hostnames for EC2 instances.
  - `EnableDnsSupport`: Enables DNS support.
  - `InstanceTenancy`: Specifies the tenancy of the instances launched in the VPC (default value: `default`).
  - `Tags`: Tags to assign to the VPC resource, including the `Name` tag.

```YAML
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: !Ref VpcCidrBlock
      EnableDnsHostnames: true
      EnableDnsSupport: true
      InstanceTenancy: default
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}VPC"
```

**InternetGateway**

The IGW enables internet connectivity for resources within the VPC, allowing your app to communicate with external services and users on the internet.


- **Type**: `AWS::EC2::InternetGateway`
- **Properties**:
  - `Tags`: Tags to assign to the internet gateway resource, including the `Name` tag.

```YAML
  IGW:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}IGW"
```


**Attaching VPC Gateway**

The IGW in VPC establishes the connectivity between your VPC and the internet, enabling inbound and outbound internet traffic for the crud app.

- **Type**: `AWS::EC2::VPCGatewayAttachment`
- **Properties**:
  - `VpcId`: References the VPC resource.
  - `InternetGatewayId`: References the InternetGateway resource.

```YAML
  AttachIGW:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      VpcId: !Ref VPC
      InternetGatewayId: !Ref IGW
```


**Route Table**

A route table contains a set of rules (routes) that determine where network traffic is directed within a VPC.

- **Type**: `AWS::EC2::RouteTable`
- **Properties**:
  - `VpcId`: References the VPC resource.
  - `Tags`: Tags to assign to the route table resource, including the `Name` tag.

```YAML
  RouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId:  !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}RT"
```

**Route To Internet Gateway**

This component defines a route in the route table to direct internet-bound traffic to the Internet Gateway to ensure that traffic destined for the Internet is directed to the IGW.

- **Type**: `AWS::EC2::Route`
- **DependsOn**: Depends on the successful attachment of the InternetGateway to the VPC.
- **Properties**:
  - `RouteTableId`: References the RouteTable resource.
  - `GatewayId`: References the InternetGateway resource.
  - `DestinationCidrBlock`: Specifies the destination CIDR block for the route (0.0.0.0/0).

```YAML
  RouteToIGW:
    Type: AWS::EC2::Route
    DependsOn: AttachIGW
    Properties:
      RouteTableId: !Ref RouteTable
      GatewayId: !Ref IGW
      DestinationCidrBlock: 0.0.0.0/0
```

**Public Subnets**

Public subnets are used to host our resources to have direct internet access and allow apps to serve requests from the internet.


- **Type**: `AWS::EC2::Subnet`
- **Properties**:
  - `AvailabilityZone`: References the Availability Zone for each subnet.
  - `CidrBlock`: References the appropriate CIDR block from the `SubnetCidrBlocks` parameter.
  - `EnableDns64`: Disables DNS64 (IPv6).
  - `MapPublicIpOnLaunch`: Specifies if a public IP is assigned to instances launched in the subnet.
  - `VpcId`: References the VPC resource.
  - `Tags`: Tags to assign to each subnet resource, including the `Name` tag.

```YAML
  SubnetPub1:
    # https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-subnet.html
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref Az1
      CidrBlock: !Select [0, !Ref SubnetCidrBlocks]
      EnableDns64: false
      MapPublicIpOnLaunch: true #public subnet
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}SubnetPub1"
  SubnetPub2:
    # https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-subnet.html
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref Az2
      CidrBlock: !Select [1, !Ref SubnetCidrBlocks]
      EnableDns64: false
      MapPublicIpOnLaunch: true #public subnet
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}SubnetPub2"
  SubnetPub3:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref Az3
      CidrBlock: !Select [2, !Ref SubnetCidrBlocks]
      EnableDns64: false
      MapPublicIpOnLaunch: true #public subnet
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}SubnetPub3"
```

**Private Subnets**

We used these private subnets to host resources that should not be directly accessible from the internet, such as RDS and DynamoDB connections.
- **Type**: `AWS::EC2::Subnet`
- **Properties**:
  - `AvailabilityZone`: References the Availability Zone for each subnet.
  - `CidrBlock`: References the appropriate CIDR block from the `SubnetCidrBlocks` parameter.
  - `EnableDns64`: Disables DNS64 (IPv6).
  - `MapPublicIpOnLaunch`: Specifies if a public IP is assigned to instances launched in the subnet (set to `false` for private subnets).
  - `VpcId`: References the VPC resource.
  - `Tags`: Tags to assign to each subnet resource, including the `Name` tag

```YAML
  SubnetPriv1:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref Az1
      CidrBlock: !Select [3, !Ref SubnetCidrBlocks]
      EnableDns64: false
      MapPublicIpOnLaunch: false #public subnet
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}SubnetPriv1"
  SubnetPriv2:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref Az2
      CidrBlock: !Select [4, !Ref SubnetCidrBlocks]
      EnableDns64: false
      MapPublicIpOnLaunch: false #public subnet
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}SubnetPriv2"
  SubnetPriv3:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref Az3
      CidrBlock: !Select [5, !Ref SubnetCidrBlocks]
      EnableDns64: false
      MapPublicIpOnLaunch: false #public subnet
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}SubnetPriv3"
```

**Subnet Associations**

Subnet associations establish the link between subnets and the route table. Mainly, to control the flow of network traffic and ensure that it follows the desired routing paths within your VPC.

- **Type**: `AWS::EC2::SubnetRouteTableAssociation`
- **Properties**:
  - `SubnetId`: References the `SubnetPub` resource.
  - `RouteTableId`: References the `RouteTable` resource.

```YAML
 SubnetPub1RTAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref SubnetPub1
      RouteTableId: !Ref RouteTable
  SubnetPub2RTAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref SubnetPub2
      RouteTableId: !Ref RouteTable
  SubnetPub3RTAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref SubnetPub3
      RouteTableId: !Ref RouteTable
  SubnetPriv1RTAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
```
**Outputs**
CloudFormation templates allow you to export certain values or resources for use in other stacks or AWS services.

- **VpcId**:
  - **Value**: This output references the `VPC` resource.
  - **Export**: The name of the export is generated using the `AWS::StackName` and appended with `VpcId`. For example, if the stack name is `MyStack`, the export name would be `${AWS::StackName}VpcId`.
- **SubnetCidrBlocks**:
  - **Value**: This output joins the `SubnetCidrBlocks` parameter using a comma-separated format.
  - **Export**: The name of the export is generated using the `AWS::StackName` and appended with `SubnetCidrBlocks`. For example, if the stack name is `MyStack`, the export name would be `${AWS::StackName}SubnetCidrBlocks`.
- **PublicSubnetIds**:
  - **Value**: This output joins the `SubnetPub1`, `SubnetPub2`, and `SubnetPub3` resources using a comma-separated format.
  - **Export**: The name of the export is generated using the `AWS::StackName` and appended with `PublicSubnetIds`. For example, if the stack name is `MyStack`, the export name would be `${AWS::StackName}PublicSubnetIds`.
- **PrivateSubnetIds**:
  - **Value**: This output joins the `SubnetPriv1`, `SubnetPriv2`, and `SubnetPriv3` resources using a comma-separated format.
  - **Export**: The name of the export is generated using the `AWS::StackName` and appended with `PrivateSubnetIds`. For example, if the stack name is `MyStack`, the export name would be `${AWS::StackName}PrivateSubnetIds`.

```YAML
Outputs:
  VpcId:
    Value: !Ref VPC
    Export:
      Name: !Sub "${AWS::StackName}VpcId"
  VpcCidrBlock:
    Value: !GetAtt VPC.CidrBlock
    Export:
      Name: !Sub "${AWS::StackName}VpcCidrBlock"
  SubnetCidrBlocks:
    Value: !Join [",", !Ref SubnetCidrBlocks]
    Export:
      Name: !Sub "${AWS::StackName}SubnetCidrBlocks"
  PublicSubnetIds:
    Value: !Join 
      - ","
      - - !Ref SubnetPub1
        - !Ref SubnetPub2
        - !Ref SubnetPub3
    Export:
      Name: !Sub "${AWS::StackName}PublicSubnetIds"
  PrivateSubnetIds:
    Value: !Join 
      - ","
      - - !Ref SubnetPriv1
        - !Ref SubnetPriv2
        - !Ref SubnetPriv3
    Export:
      Name: !Sub "${AWS::StackName}PrivateSubnetIds"
```


**Availability Zones**

  - **Value**: This output joins the `Az1`, `Az2`, and `Az3` parameters using a comma-separated format.
  - **Export**:
    - **Name**: The name of the export is generated using the `AWS::StackName` and appended with `AvailabilityZones`. For example, if the stack name is `MyStack`, the export name would be `${AWS::StackName}AvailabilityZones`.
```YAML
  AvailabilityZones:
    Value: !Join 
      - ","
      - - !Ref Az1
        - !Ref Az2
        - !Ref Az3
    Export:
      Name: !Sub "${AWS::StackName}AvailabilityZones"
```

The above networking components have been covered for the foundation of our Cruddur app's network layer. 
<details>

<summary>
❗Expand and view the networking layer full template. 
</summary>


```YAML
AWSTemplateFormatVersion: 2010-09-09
Description: |
 This YAML file defines the foundational networking components for our stack, including:
  - VPC
    - configures DNS hostnames for EC2 instances
    - only allows2 traffic from IPV4, IPV6 is disabled
  - InternetGateway
  - Route Table that enables routing to the InternetGateway and local resources
    - route to the IGW
    - route to Local
  - Six subnets, each explicitly associated with the Route Table:
    - 3 Public Subnets numbered 1 to 3
    - 3 Private Subnets numbered 1 to 3
Parameters:
  VpcCidrBlock:
    Type: String
    Default: 10.0.0.0/16
  Az1:
    Type: AWS::EC2::AvailabilityZone::Name
    Default: us-east-1a
  SubnetCidrBlocks: 
    Description: "Comma-delimited list of CIDR blocks for our private public subnets"
    Type: CommaDelimitedList
    Default: >
      10.0.0.0/24, 
      10.0.4.0/24, 
      10.0.8.0/24, 
      10.0.12.0/24,
      10.0.16.0/24,
      10.0.20.0/24
  Az2:
    Type: AWS::EC2::AvailabilityZone::Name
    Default: us-east-1b
  Az3:
    Type: AWS::EC2::AvailabilityZone::Name
    Default: us-east-1c
Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: !Ref VpcCidrBlock
      EnableDnsHostnames: true
      EnableDnsSupport: true
      InstanceTenancy: default
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}VPC"
  IGW:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}IGW"
  AttachIGW:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      VpcId: !Ref VPC
      InternetGatewayId: !Ref IGW
  RouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId:  !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}RT"
  RouteToIGW:
    Type: AWS::EC2::Route
    DependsOn: AttachIGW
    Properties:
      RouteTableId: !Ref RouteTable
      GatewayId: !Ref IGW
      DestinationCidrBlock: 0.0.0.0/0
  SubnetPub1:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref Az1
      CidrBlock: !Select [0, !Ref SubnetCidrBlocks]
      EnableDns64: false
      MapPublicIpOnLaunch: true #public subnet
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}SubnetPub1"
  SubnetPub2:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref Az2
      CidrBlock: !Select [1, !Ref SubnetCidrBlocks]
      EnableDns64: false
      MapPublicIpOnLaunch: true #public subnet
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}SubnetPub2"
  SubnetPub3:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref Az3
      CidrBlock: !Select [2, !Ref SubnetCidrBlocks]
      EnableDns64: false
      MapPublicIpOnLaunch: true #public subnet
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}SubnetPub3"
  SubnetPriv1:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref Az1
      CidrBlock: !Select [3, !Ref SubnetCidrBlocks]
      EnableDns64: false
      MapPublicIpOnLaunch: false 
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}SubnetPriv1"
  SubnetPriv2:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref Az2
      CidrBlock: !Select [4, !Ref SubnetCidrBlocks]
      EnableDns64: false
      MapPublicIpOnLaunch: false 
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}SubnetPriv2"
  SubnetPriv3:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Ref Az3
      CidrBlock: !Select [5, !Ref SubnetCidrBlocks]
      EnableDns64: false
      MapPublicIpOnLaunch: false 
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub "${AWS::StackName}SubnetPriv3"
  SubnetPub1RTAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref SubnetPub1
      RouteTableId: !Ref RouteTable
  SubnetPub2RTAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref SubnetPub2
      RouteTableId: !Ref RouteTable
  SubnetPub3RTAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref SubnetPub3
      RouteTableId: !Ref RouteTable
  SubnetPriv1RTAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref SubnetPriv1
      RouteTableId: !Ref RouteTable
  SubnetPriv2RTAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref SubnetPriv2
      RouteTableId: !Ref RouteTable
  SubnetPriv3RTAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref SubnetPriv3
      RouteTableId: !Ref RouteTable
Outputs:
  VpcId:
    Value: !Ref VPC
    Export:
      Name: !Sub "${AWS::StackName}VpcId"
  VpcCidrBlock:
    Value: !GetAtt VPC.CidrBlock
    Export:
      Name: !Sub "${AWS::StackName}VpcCidrBlock"
  SubnetCidrBlocks:
    Value: !Join [",", !Ref SubnetCidrBlocks]
    Export:
      Name: !Sub "${AWS::StackName}SubnetCidrBlocks"
  PublicSubnetIds:
    Value: !Join 
      - ","
      - - !Ref SubnetPub1
        - !Ref SubnetPub2
        - !Ref SubnetPub3
    Export:
      Name: !Sub "${AWS::StackName}PublicSubnetIds"
  PrivateSubnetIds:
    Value: !Join 
      - ","
      - - !Ref SubnetPriv1
        - !Ref SubnetPriv2
        - !Ref SubnetPriv3
    Export:
      Name: !Sub "${AWS::StackName}PrivateSubnetIds"
  AvailabilityZones:
    Value: !Join 
      - ","
      - - !Ref Az1
        - !Ref Az2
        - !Ref Az3
    Export:
      Name: !Sub "${AWS::StackName}AvailabilityZones"
```

</details>

This template was saved in `aws/cfn/networking/template.yaml`

---

### Cluster Stack

This stack builds upon our networking stack and takes the output from it to build our cluster. It specifically requires the ARN of our domain certificate to create a HTTPS listener and the name of our networking stack to be able to reference its outputs (Public Subnets etc.)

1. Create a new TOML file `aws/cfn/cluster/config.toml`

```cfn
[deploy]
bucket = 'cfn-artifacts'
region = 'us-east-1'
stack_name = 'CrdCluster'

[parameters]
CertificateArn = 'arn:aws:acm:<region>:<aws-id>:certificate/4b87772d-385b-8764-3f2s-fhfhf14ffbd50'
NetworkingStack = 'CrdNet'
```


2. Pass the parameters to bin directory for deploying here; `bin/cfn/cluster` in the cluster-deploy script  

```YAML
#! /usr/bin/env bash
set -e 

CFN_PATH="/workspace/aws-cloud-project-bootcamp/aws/cfn/cluster/template.yaml"
CONFIG_PATH="/workspace/aws-cloud-project-bootcamp/aws/cfn/cluster/config.toml"
echo $CFN_PATH

cfn-lint $CFN_PATH

# TOML Zone
BUCKET=$(cfn-toml key deploy.bucket -t $CONFIG_PATH)
REGION=$(cfn-toml key deploy.region -t $CONFIG_PATH)
STACK_NAME=$(cfn-toml key deploy.stack_name -t $CONFIG_PATH)
PARAMETERS=$(cfn-toml params v2 -t $CONFIG_PATH)
# TOML Zone

aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --s3-bucket $BUCKET \
  --region $REGION \
  --template-file "$CFN_PATH" \
  --no-execute-changeset \
  --tags group=cruddur-cluster \
  --parameter-overrides $PARAMETERS \
  --capabilities CAPABILITY_NAMED_IAM
```

3. Run the bash script file `./bin/cfn/cluster-deploy` this fetches information from Toml.

**Cluster Description**

Create `aws/cfn/cluster/template.yaml` and view below the description.


| Resource                        | Description                                                     |
| ------------------------------- | --------------------------------------------------------------- |
| ECS Fargate Cluster             | Configures an ECS Fargate Cluster.                               |
| Application Load Balancer (ALB) | Sets up an ALB that is IPv4 only and internet-facing.            |
| ALB Security Group              | Defines a security group for the ALB.                            |
| Certificate (ACM)               | Attaches a certificate from Amazon Certification Manager (ACM).  |
| HTTPS Listener                  | Listens for HTTPS traffic and directs it to appropriate targets. |
| HTTP Listener                   | Listens for HTTP traffic and redirects it to HTTPS.              |
| Backend Target Group            | Routes traffic to the backend service.                           |
| Frontend Target Group           | Routes traffic to the frontend service.                          |

Add the section to your  `Description` in cluster `template.yaml`

```YAML
AWSTemplateFormatVersion: 2010-09-09
Description: |
 This template defines the networking and cluster configuration required to support Fargate containers. It includes:
  - ECS Fargate Cluster
  - Application Load Balanacer (ALB)
    - ipv4 only
    - internet facing
  - ALB Security Group
  - certificate attached from Amazon Certification Manager (ACM)
  - HTTPS Listerner
    - send naked domain to frontend Target Group
    - send api. subdomain to backend Target Group
  - HTTP Listerner
    - redirects to HTTPS Listerner
  - Backend Target Group
  - Frontend Target Group
```

**Cluster Parameters**

Parameters:
- **NetworkingStack**: This parameter represents the base layer of networking components, such as VPC and subnets. It allows you to specify the networking stack to use as the foundation for the Fargate cluster. 
- **CertificateArn**: This parameter is of type string and is used to specify the ARN (Amazon Resource Name) of the certificate attached from Amazon Certification Manager (ACM). It allows you to associate an SSL/TLS certificate with the Application Load Balancer (ALB) for secure communication.
  
```yaml
Parameters:
  NetworkingStack:
    Type: String
    Description: This is our base layer of networking components eg. VPC, Subnets
    Default: CrdNet
  CertificateArn:
    Type: String
```

**Cluster Frontend**

- **FrontendPort**: This represents the port number for the frontend. The default value is set to 3000.
- **FrontendHealthCheckIntervalSeconds**: This specifies the interval, in seconds, between health checks for the frontend service. The default value is set to 15.
- **FrontendHealthCheckPath**: This represents the path that is used for the health check of the frontend service.
- **FrontendHealthCheckPort**: This defines the port that the ALB uses for health checks on the frontend service.
- **FrontendHealthCheckProtocol**: used for health checks on the frontend service. It specifies whether HTTP or HTTPS is used for the health check.
- **FrontendHealthCheckTimeoutSeconds**: determines how long the ALB waits for a response before considering the health check as failed.
- **FrontendHealthyThresholdCount**: This defines the number of consecutive successful health checks required to consider the frontend service as healthy.
- **FrontendUnhealthyThresholdCount**: This specifies the number of consecutive failed health checks required to consider the frontend service as unhealthy. 

```YAML
  FrontendPort:
    Type: Number
    Default: 3000
  FrontendHealthCheckIntervalSeconds:
    Type: Number
    Default: 15
  FrontendHealthCheckPath:
    Type: String
    Default: "/"
  FrontendHealthCheckPort:
    Type: String
    Default: 80
  FrontendHealthCheckProtocol:
    Type: String
    Default: HTTP
  FrontendHealthCheckTimeoutSeconds:
    Type: Number
    Default: 5
  FrontendHealthyThresholdCount:
    Type: Number
    Default: 2
  FrontendUnhealthyThresholdCount:
    Type: Number
    Default: 2
```


**Cluster Backend**

- **BackendPort**: This represents the port number for the backend and is set to 4567.
- **BackendHealthCheckIntervalSeconds**: Same applies as frontend.
- **BackendHealthCheckPath**: It specifies the endpoint that the ALB uses to check the health of the backend service and is set to `"/api/health-check".`
- **BackendHealthCheckPort**: This parameter is of type string and defines the port that the ALB uses
- **BackendHealthCheckProtocol:**  It specifies whether HTTP or HTTPS is used for the health check. The default value is set to HTTP.
- **BackendHealthCheckTimeoutSeconds:** determines how long the ALB waits for a response before considering the health check as failed. The default value is set to 5.
- **BackendHealthyThresholdCount:** It specifies the minimum number of successful health checks needed to mark the service as healthy.
- **BackendUnhealthyThresholdCount:** This parameter is of type number and specifies the number of consecutive failed health checks required to consider the backend service as unhealthy. 

```YAML
  BackendPort:
    Type: Number
    Default: 4567
  BackendHealthCheckIntervalSeconds:
    Type: String
    Default: 15
  BackendHealthCheckPath:
    Type: String
    Default: "/api/health-check"
  BackendHealthCheckPort:
    Type: String
    Default: 80
  BackendHealthCheckProtocol:
    Type: String
    Default: HTTP
  BackendHealthCheckTimeoutSeconds:
    Type: Number
    Default: 5
  BackendHealthyThresholdCount:
    Type: Number
    Default: 2
  BackendUnhealthyThresholdCount:
    Type: Number
    Default: 2
```

**Cluster Required Resources**

### FargateCluster
The `FargateCluster` resource represents an ECS cluster using Fargate. It is the foundation of the containerized infrastructure. The properties for this resource include:

- `ClusterName`: The name of the ECS cluster.
- `CapacityProviders`: The capacity providers to associate with the cluster. In this case, it is set to `FARGATE`.
- `ClusterSettings`: Additional settings for the cluster. Here, the `containerInsights` setting is enabled.
- `Configuration`: Configuration settings for executing commands within the cluster, with the `Logging` property set to `DEFAULT`.
- `ServiceConnectDefaults`: Default settings for Service Discovery namespaces within the cluster.

```YAML
Resources:
  FargateCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: !Sub "${AWS::StackName}FargateCluster"
      CapacityProviders:
        - FARGATE
      ClusterSettings:
        - Name: containerInsights
          Value: enabled
      Configuration:
        ExecuteCommandConfiguration:
          Logging: DEFAULT
      ServiceConnectDefaults:
        Namespace: cruddur
```

**Application Load Balancer**

The `ALB` resource represents an Application Load Balancer. It acts as the entry point for incoming traffic and distributes it to the appropriate target groups. The properties for this resource include:

- `Name`: The name of the load balancer.
- `Type`: The type of load balancer, set to `application`.
- `IpAddressType`: The IP address type for the load balancer, set to `ipv4`.
- `Scheme`: The scheme of the load balancer, set to `internet-facing`.
- `SecurityGroups`: The security groups associated with the load balancer.
- `Subnets`: The subnets in which the load balancer is deployed.
- `LoadBalancerAttributes`: Additional attributes for the load balancer, such as enabling HTTP/2, cross-zone load balancing, and more.

```YAML
  ALB:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties: 
      Name: !Sub "${AWS::StackName}ALB"
      Type: application
      IpAddressType: ipv4
      Scheme: internet-facing
      SecurityGroups:
        - !GetAtt ALBSG.GroupId
      Subnets:
        Fn::Split:
          - ","
          - Fn::ImportValue:
              !Sub "${NetworkingStack}PublicSubnetIds"
      LoadBalancerAttributes:
        - Key: routing.http2.enabled
          Value: true
        - Key: routing.http.preserve_host_header.enabled
          Value: false
        - Key: deletion_protection.enabled
          Value: true
        - Key: load_balancing.cross_zone.enabled
          Value: true
        - Key: access_logs.s3.enabled
          Value: false
```

**HTTPS Listener**

The `HTTPSListener` resource represents the HTTPS listener of the Application Load Balancer. It listens for incoming HTTPS traffic on port 443. The properties for this resource include:

- `Protocol`: The protocol for the listener, set to `HTTPS`.
- `Port`: The port on which the listener listens.
- `LoadBalancerArn`: The ARN of the load balancer to which the listener is attached.
- `Certificates`: The SSL/TLS certificates associated with the listener.
- `DefaultActions`: The default actions to be performed when a request matches the listener.
```YAML
  HTTPSListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      Protocol: HTTPS
      Port: 443
      LoadBalancerArn: !Ref ALB
      Certificates: 
        - CertificateArn: !Ref CertificateArn
      DefaultActions:
        - Type: forward
          TargetGroupArn:  !Ref FrontendTG
```

**HTTP Listener**

The `HTTPListener` resource represents the HTTP listener of the Application Load Balancer. It listens for incoming HTTP traffic on port 80 and redirects it to HTTPS. The properties for this resource include:

- `Protocol`: The protocol for the listener, set to `HTTP`.
- `Port`: The port on which the listener listens.
- `LoadBalancerArn`: The ARN of the load balancer to which the listener is attached.
- `DefaultActions`: The default actions to be performed when a request matches the listener, in this case, a redirect to HTTPS.

```YAML
  HTTPListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
        Protocol: HTTP
        Port: 80
        LoadBalancerArn: !Ref ALB
        DefaultActions:
          - Type: redirect
            RedirectConfig:
              Protocol: "HTTPS"
              Port: 443
              Host: "#{host}"
              Path: "/#{path}"
              Query: "#{query}"
              StatusCode: "HTTP_301"
```

**API ALB Listerner Rule**

The `ApiALBListernerRule` resource represents a listener rule for the API subdomain. It defines conditions and actions for routing requests to the backend target group. The properties for this resource include:

- `Conditions`: The conditions that must be met for the rule to be applied.
- `Actions`: The actions to be performed when a request matches the rule.
- `ListenerArn`: The ARN of the listener to which the rule belongs.
- `Priority`: The priority of the rule to determine its order of evaluation.
```YAML
  ApiALBListernerRule:
    Type: AWS::ElasticLoadBalancingV2::ListenerRule
    Properties:
      Conditions: 
        - Field: host-header
          HostHeaderConfig: 
            Values: 
              - api.cruddur.com
      Actions: 
        - Type: forward
          TargetGroupArn:  !Ref BackendTG
      ListenerArn: !Ref HTTPSListener
      Priority: 1
```

**ALB Security Group**

The `ALBSG` resource represents the security group associated with the Application Load Balancer. It controls the inbound and outbound traffic for the load balancer. The properties for this resource include:

- `GroupName`: The name of the security group.
- `GroupDescription`: The description of the security group.
- `VpcId`: The ID of the VPC in which the security group resides.
- `SecurityGroupIngress`: The inbound rules for the security group, specifying the allowed protocols, ports, and source IP ranges.

```YAML
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupName: !Sub "${AWS::StackName}AlbSG"
      GroupDescription: Public Facing SG for our Cruddur ALB
      VpcId:
        Fn::ImportValue:
          !Sub ${NetworkingStack}VpcId
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: '0.0.0.0/0'
          Description: INTERNET HTTPS
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: '0.0.0.0/0'
          Description: INTERNET HTTP
```

**Fargate Service Security Group**

The `ServiceSG` resource represents the security group for the Fargate services. It controls the inbound and outbound traffic for the services. The properties for this resource include:

- `GroupName`: The name of the security group.
- `GroupDescription`: The description of the security group.
- `VpcId`: The ID of the VPC in which the security group resides.
- `SecurityGroupIngress`: The inbound rules for the security group, specifying the allowed protocols, ports, and source security group.
  
```YAML
  ServiceSG:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupName: !Sub "${AWS::StackName}ServSG"
      GroupDescription: Security for Fargate Services for Cruddur
      VpcId:
        Fn::ImportValue:
          !Sub ${NetworkingStack}VpcId
      SecurityGroupIngress:
        - IpProtocol: tcp
          SourceSecurityGroupId: !GetAtt ALBSG.GroupId
          FromPort: !Ref BackendPort
          ToPort: !Ref BackendPort
          Description: ALB HTTP
```

**Backend Target Group**

The `BackendTG` resource represents the target group for the backend services. It defines the health checks and routing configuration for the services. The properties for this resource include:
```YAML
 BackendTG:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Port: !Ref BackendPort
      HealthCheckEnabled: true
      HealthCheckProtocol: !Ref BackendHealthCheckProtocol
      HealthCheckIntervalSeconds: !Ref BackendHealthCheckIntervalSeconds
      HealthCheckPath: !Ref BackendHealthCheckPath
      HealthCheckPort: !Ref BackendHealthCheckPort
      HealthCheckTimeoutSeconds: !Ref BackendHealthCheckTimeoutSeconds
      HealthyThresholdCount: !Ref BackendHealthyThresholdCount
      UnhealthyThresholdCount: !Ref BackendUnhealthyThresholdCount
      IpAddressType: ipv4
      Matcher: 
        HttpCode: 200
      Protocol: HTTP
      ProtocolVersion: HTTP2
      TargetType: ip
      TargetGroupAttributes: 
        - Key: deregistration_delay.timeout_seconds
          Value: 0
      VpcId:
        Fn::ImportValue:
          !Sub ${NetworkingStack}VpcId
      Tags:
        - Key: target-group-name
          Value: backend
```

**Frontend Target Group**

The `FrontendTG` resource represents the target group for the frontend services. It defines the health checks and routing configuration for the services. 

```YAML
 FrontendTG:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Port: !Ref FrontendPort
      HealthCheckEnabled: true
      HealthCheckProtocol: !Ref FrontendHealthCheckProtocol
      HealthCheckIntervalSeconds: !Ref FrontendHealthCheckIntervalSeconds
      HealthCheckPath: !Ref FrontendHealthCheckPath
      HealthCheckPort: !Ref FrontendHealthCheckPort
      HealthCheckTimeoutSeconds: !Ref FrontendHealthCheckTimeoutSeconds
      HealthyThresholdCount: !Ref FrontendHealthyThresholdCount
      UnhealthyThresholdCount: !Ref FrontendUnhealthyThresholdCount
      IpAddressType: ipv4
      Matcher: 
        HttpCode: 200
      Protocol: HTTP
      ProtocolVersion: HTTP2
      TargetType: ip
      TargetGroupAttributes: 
        - Key: deregistration_delay.timeout_seconds
          Value: 0
      VpcId:
        Fn::ImportValue:
          !Sub ${NetworkingStack}VpcId
      Tags:
        - Key: target-group-name
          Value: frontend
```

**Cluster Outputs**

Specify the output values for `ClusterName`, `ServiceSecurityGroupId`, `ALBSecurityGroupId`, `FrontendTGArn`and `BackendTGArn`.

```YAML
Outputs:
  ClusterName:
    Value: !Ref FargateCluster
    Export:
      Name: !Sub "${AWS::StackName}ClusterName"
  ServiceSecurityGroupId:
    Value: !GetAtt ServiceSG.GroupId
    Export:
      Name: !Sub "${AWS::StackName}ServiceSecurityGroupId"
  ALBSecurityGroupId:
    Value: !GetAtt ALBSG.GroupId
    Export:
      Name: !Sub "${AWS::StackName}ALBSecurityGroupId"
  FrontendTGArn:
    Value: !Ref FrontendTG
    Export:
      Name: !Sub "${AWS::StackName}FrontendTGArn"
  BackendTGArn:
    Value: !Ref BackendTG
    Export:
      Name: !Sub "${AWS::StackName}BackendTGArn"
```

<details>

<summary>
❗Expand and view the Cluster full template. 
</summary>

```YAML
AWSTemplateFormatVersion: 2010-09-09

Description: |
 This template defines the networking and cluster configuration required to support Fargate containers. It includes:
  - ECS Fargate Cluster
  - Application Load Balanacer (ALB)
    - ipv4 only
    - internet facing
  - ALB Security Group
  - certificate attached from Amazon Certification Manager (ACM)
  - HTTPS Listerner
    - send naked domain to frontend Target Group
    - send api. subdomain to backend Target Group
  - HTTP Listerner
    - redirects to HTTPS Listerner
  - Backend Target Group
  - Frontend Target Group
Parameters:
  NetworkingStack:
    Type: String
    Description: This is our base layer of networking components eg. VPC, Subnets
    Default: CrdNet
  CertificateArn:
    Type: String
  #Frontend ------
  FrontendPort:
    Type: Number
    Default: 3000
  FrontendHealthCheckIntervalSeconds:
    Type: Number
    Default: 15
  FrontendHealthCheckPath:
    Type: String
    Default: "/"
  FrontendHealthCheckPort:
    Type: String
    Default: 80
  FrontendHealthCheckProtocol:
    Type: String
    Default: HTTP
  FrontendHealthCheckTimeoutSeconds:
    Type: Number
    Default: 5
  FrontendHealthyThresholdCount:
    Type: Number
    Default: 2
  FrontendUnhealthyThresholdCount:
    Type: Number
    Default: 2
  #Backend ------
  BackendPort:
    Type: Number
    Default: 4567
  BackendHealthCheckIntervalSeconds:
    Type: String
    Default: 15
  BackendHealthCheckPath:
    Type: String
    Default: "/api/health-check"
  BackendHealthCheckPort:
    Type: String
    Default: 80
  BackendHealthCheckProtocol:
    Type: String
    Default: HTTP
  BackendHealthCheckTimeoutSeconds:
    Type: Number
    Default: 5
  BackendHealthyThresholdCount:
    Type: Number
    Default: 2
  BackendUnhealthyThresholdCount:
    Type: Number
    Default: 2
Resources:
  FargateCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: !Sub "${AWS::StackName}FargateCluster"
      CapacityProviders:
        - FARGATE
      ClusterSettings:
        - Name: containerInsights
          Value: enabled
      Configuration:
        ExecuteCommandConfiguration:
          Logging: DEFAULT
      ServiceConnectDefaults:
        Namespace: cruddur
  ALB:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties: 
      Name: !Sub "${AWS::StackName}ALB"
      Type: application
      IpAddressType: ipv4
      Scheme: internet-facing
      SecurityGroups:
        - !GetAtt ALBSG.GroupId
      Subnets:
        Fn::Split:
          - ","
          - Fn::ImportValue:
              !Sub "${NetworkingStack}PublicSubnetIds"
      LoadBalancerAttributes:
        - Key: routing.http2.enabled
          Value: true
        - Key: routing.http.preserve_host_header.enabled
          Value: false
        - Key: deletion_protection.enabled
          Value: true
        - Key: load_balancing.cross_zone.enabled
          Value: true
        - Key: access_logs.s3.enabled
          Value: false
  HTTPSListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      Protocol: HTTPS
      Port: 443
      LoadBalancerArn: !Ref ALB
      Certificates: 
        - CertificateArn: !Ref CertificateArn
      DefaultActions:
        - Type: forward
          TargetGroupArn:  !Ref FrontendTG
  HTTPListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
        Protocol: HTTP
        Port: 80
        LoadBalancerArn: !Ref ALB
        DefaultActions:
          - Type: redirect
            RedirectConfig:
              Protocol: "HTTPS"
              Port: 443
              Host: "#{host}"
              Path: "/#{path}"
              Query: "#{query}"
              StatusCode: "HTTP_301"
  ApiALBListernerRule:
    Type: AWS::ElasticLoadBalancingV2::ListenerRule
    Properties:
      Conditions: 
        - Field: host-header
          HostHeaderConfig: 
            Values: 
              - api.cruddur.com
      Actions: 
        - Type: forward
          TargetGroupArn:  !Ref BackendTG
      ListenerArn: !Ref HTTPSListener
      Priority: 1
  ALBSG:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupName: !Sub "${AWS::StackName}AlbSG"
      GroupDescription: Public Facing SG for our Cruddur ALB
      VpcId:
        Fn::ImportValue:
          !Sub ${NetworkingStack}VpcId
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: '0.0.0.0/0'
          Description: INTERNET HTTPS
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: '0.0.0.0/0'
          Description: INTERNET HTTP
  ServiceSG:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupName: !Sub "${AWS::StackName}ServSG"
      GroupDescription: Security for Fargate Services for Cruddur
      VpcId:
        Fn::ImportValue:
          !Sub ${NetworkingStack}VpcId
      SecurityGroupIngress:
        - IpProtocol: tcp
          SourceSecurityGroupId: !GetAtt ALBSG.GroupId
          FromPort: !Ref BackendPort
          ToPort: !Ref BackendPort
          Description: ALB HTTP
  BackendTG:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Port: !Ref BackendPort
      HealthCheckEnabled: true
      HealthCheckProtocol: !Ref BackendHealthCheckProtocol
      HealthCheckIntervalSeconds: !Ref BackendHealthCheckIntervalSeconds
      HealthCheckPath: !Ref BackendHealthCheckPath
      HealthCheckPort: !Ref BackendHealthCheckPort
      HealthCheckTimeoutSeconds: !Ref BackendHealthCheckTimeoutSeconds
      HealthyThresholdCount: !Ref BackendHealthyThresholdCount
      UnhealthyThresholdCount: !Ref BackendUnhealthyThresholdCount
      IpAddressType: ipv4
      Matcher: 
        HttpCode: 200
      Protocol: HTTP
      ProtocolVersion: HTTP2
      TargetType: ip
      TargetGroupAttributes: 
        - Key: deregistration_delay.timeout_seconds
          Value: 0
      VpcId:
        Fn::ImportValue:
          !Sub ${NetworkingStack}VpcId
      Tags:
        - Key: target-group-name
          Value: backend
  FrontendTG:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Port: !Ref FrontendPort
      HealthCheckEnabled: true
      HealthCheckProtocol: !Ref FrontendHealthCheckProtocol
      HealthCheckIntervalSeconds: !Ref FrontendHealthCheckIntervalSeconds
      HealthCheckPath: !Ref FrontendHealthCheckPath
      HealthCheckPort: !Ref FrontendHealthCheckPort
      HealthCheckTimeoutSeconds: !Ref FrontendHealthCheckTimeoutSeconds
      HealthyThresholdCount: !Ref FrontendHealthyThresholdCount
      UnhealthyThresholdCount: !Ref FrontendUnhealthyThresholdCount
      IpAddressType: ipv4
      Matcher: 
        HttpCode: 200
      Protocol: HTTP
      ProtocolVersion: HTTP2
      TargetType: ip
      TargetGroupAttributes: 
        - Key: deregistration_delay.timeout_seconds
          Value: 0
      VpcId:
        Fn::ImportValue:
          !Sub ${NetworkingStack}VpcId
      Tags:
        - Key: target-group-name
          Value: frontend
Outputs:
  ClusterName:
    Value: !Ref FargateCluster
    Export:
      Name: !Sub "${AWS::StackName}ClusterName"
  ServiceSecurityGroupId:
    Value: !GetAtt ServiceSG.GroupId
    Export:
      Name: !Sub "${AWS::StackName}ServiceSecurityGroupId"
  ALBSecurityGroupId:
    Value: !GetAtt ALBSG.GroupId
    Export:
      Name: !Sub "${AWS::StackName}ALBSecurityGroupId"
  FrontendTGArn:
    Value: !Ref FrontendTG
    Export:
      Name: !Sub "${AWS::StackName}FrontendTGArn"
  BackendTGArn:
    Value: !Ref BackendTG
    Export:
      Name: !Sub "${AWS::StackName}BackendTGArn"
```

</details>


Create `bin/cfn/cluster` script and make it executable by running `chmod u+x` in terminal before deploying cluster

```sh
#! /usr/bin/bash

set -e 

abs_template_filepath="/workspace/aws-cloud-project-bootcamp/aws/cfn/cluster/template.yaml"
TemplateFilePath=$(realpath --relative-base="$PWD" "$abs_template_filepath")

abs_config_filepath="/workspace/aws-cloud-project-bootcamp/aws/cfn/cluster/config.toml"
ConfigFilePath=$(realpath --relative-base="$PWD" "$abs_config_filepath")

BUCKET=$(cfn-toml key deploy.bucket -t $ConfigFilePath)
REGION=$(cfn-toml key deploy.region -t $ConfigFilePath)
STACK_NAME=$(cfn-toml key deploy.stack_name -t $ConfigFilePath)
PARAMETERS=$(cfn-toml params v2 -t $ConfigFilePath)

cfn-lint $TemplateFilePath

aws cloudformation deploy \
  --stack-name "$STACK_NAME" \
  --s3-bucket "$BUCKET" \
  --s3-prefix cluster \
  --region $REGION \
  --template-file $TemplateFilePath \
  --no-execute-changeset \
  --tags group=cruddur-cluster \
  --parameter-overrides $PARAMETERS \
  --capabilities CAPABILITY_NAMED_IAM
```
5. Deploy the template using `./bin/cfn/cluster`

![Deployed CrdCluster](assets/week10/DeployedCrdCluster.png)

 > *Execute the changeset*


### AWS CFN RDS STACK

**Describing the template**

This is the cfn for the primary Postgres RDS Database for crud function.

```YAML
AWSTemplateFormatVersion: 2010-09-09
Description: |
  The primary Postgres RDS Database for the application
  - RDS Instance
  - Database Security Group
```

**Parameters**

- `NetworkingStack`: This parameter represents the base layer of networking components, such as VPC and subnets.
- `ClusterStack`: This parameter represents the Fargate cluster.
- `BackupRetentionPeriod`: This parameter specifies the number of days to retain automated backups.
- `DBInstanceClass`: This parameter defines the compute and memory capacity for the database instance.
```YAML
Parameters:
  NetworkingStack:
    Type: String
    Description: This is our base layer of networking components eg. VPC, Subnets
    Default: CrdNet
  ClusterStack:
    Type: String
    Description: This is our FargateCluster
    Default: CrdCluster
  BackupRetentionPeriod:
    Type: Number
    Default: 0
  DBInstanceClass:
    Type: String
    Default: db.t4g.micro
```
- `DBInstanceIdentifier`: This parameter specifies the identifier for the database instance.
- `DBName`: This parameter specifies the name of the database.
- `DeletionProtection`: This parameter indicates whether deletion protection is enabled or not.
- `EngineVersion`: This parameter specifies the version number of the database engine.
- `MasterUsername`: This parameter specifies the master username for the database instance.
- `MasterUserPassword`: This parameter specifies the master user password for the database instance.
```YAML
  DBInstanceIdentifier:
    Type: String
    Default: cruddur-instance
  DBName:
    Type: String
    Default: cruddur
  DeletionProtection:
    Type: String
    AllowedValues:
      - true
      - false
    Default: true
  EngineVersion:
    Type: String
    Default: '15.2'
  MasterUsername:
    Type: String
  MasterUserPassword:
    Type: String
    NoEcho: true
```

**PostgreSQL Resource**

- Type: AWS::EC2::SecurityGroup
- Description: Public Facing SG for our Cruddur ALB
- Properties:
  - `GroupName`: The name of the security group.
  - `GroupDescription`: The description of the security group.
  - `VpcId`: The ID of the VPC.
  - `SecurityGroupIngress`: Ingress rules for the security group.

```YAML
# Start Resource Section
Resources:
  RDSPostgresSG:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupName: !Sub "${AWS::StackName}RDSSG"
      GroupDescription: Public Facing SG for our Cruddur ALB
      VpcId:
        Fn::ImportValue:
          !Sub ${NetworkingStack}VpcId
      SecurityGroupIngress:
        - IpProtocol: tcp
          SourceSecurityGroupId:
            Fn::ImportValue:
              !Sub ${ClusterStack}ServiceSecurityGroupId
          FromPort: 5432
          ToPort: 5432
          Description: ALB HTTP
```

**PosgreSQL Subnet Group** 

- Type: AWS::RDS::DBSubnetGroup
- Properties:
  - `DBSubnetGroupName`: The name of the DB subnet group.
  - `DBSubnetGroupDescription`: The description of the DB subnet group.
  - `SubnetIds`: IDs of the subnets in the DB subnet group.
```YAML
  DBSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupName: !Sub "${AWS::StackName}DBSubnetGroup"
      DBSubnetGroupDescription: !Sub "${AWS::StackName}DBSubnetGroup"
      SubnetIds: { 'Fn::Split' : [ ','  , { "Fn::ImportValue": { "Fn::Sub": "${NetworkingStack}PublicSubnetIds" }}] }
```

**Database**

- Type: AWS::RDS::DBInstance
- Properties:
  - `AllocatedStorage`: The amount of storage to allocate to the database instance.
  - `AllowMajorVersionUpgrade`: Indicates whether major version upgrades are allowed.
  - `AutoMinorVersionUpgrade`: Indicates whether minor version upgrades are applied automatically.
  - `BackupRetentionPeriod`: The number of days to retain automated backups.
  - `DBInstanceClass`: The compute and memory capacity for the database instance.
  - `DBInstanceIdentifier`: The identifier for the database instance.

```YAML
  Database:
    Type: AWS::RDS::DBInstance
    DeletionPolicy: 'Snapshot'
    UpdateReplacePolicy: 'Snapshot'
    Properties:
      AllocatedStorage: '20'
      AllowMajorVersionUpgrade: true
      AutoMinorVersionUpgrade: true
      BackupRetentionPeriod: !Ref  BackupRetentionPeriod
      DBInstanceClass: !Ref DBInstanceClass
      DBInstanceIdentifier: !Ref DBInstanceIdentifier
```

**DB Connection Properties:**

  - `DBName`: The name of the database.
  - `DBSubnetGroupName`: The name of the DB subnet group to associate with the database instance.
  - `DeletionProtection`: Indicates whether deletion protection is enabled.
  - `EnablePerformanceInsights`: Indicates whether Performance Insights is enabled.
  - `Engine`: The name of the database engine.
  - `EngineVersion`: The version number of the database engine.
  - `MasterUsername`: The master username for the database instance.
  - `MasterUserPassword`: The master user password for the database instance.
  - `PubliclyAccessible`: Indicates whether the database instance is publicly accessible.
  - `VPCSecurityGroups`: Security groups associated with the database instance.
    
```YAML
      DBName: !Ref DBName
      DBSubnetGroupName: !Ref DBSubnetGroup
      DeletionProtection: !Ref DeletionProtection
      EnablePerformanceInsights: true
      Engine: postgres
      EngineVersion: !Ref EngineVersion
      # Must be 1 to 63 letters or numbers.
      # First character must be a letter.
      # Can't be a reserved word for the chosen database engine.
      MasterUsername:  !Ref MasterUsername
      # Constraints: Must contain from 8 to 128 characters.
      MasterUserPassword: !Ref MasterUserPassword
      PubliclyAccessible: true
      VPCSecurityGroups:
        - !GetAtt RDSPostgresSG.GroupId
```
<details>

<summary>
❗Expand and apply the entire RDS Databse template. 
</summary>

```YAML
AWSTemplateFormatVersion: 2010-09-09
Description: |
  The primary Postgres RDS Database for the application
  - RDS Instance
  - Database Security Group
Parameters:
  NetworkingStack:
    Type: String
    Description: This is our base layer of networking components eg. VPC, Subnets
    Default: CrdNet
  ClusterStack:
    Type: String
    Description: This is our FargateCluster
    Default: CrdCluster
  BackupRetentionPeriod:
    Type: Number
    Default: 0
  DBInstanceClass:
    Type: String
    Default: db.t4g.micro
  DBInstanceIdentifier:
    Type: String
    Default: cruddur-instance
  DBName:
    Type: String
    Default: cruddur
  DeletionProtection:
    Type: String
    AllowedValues:
      - true
      - false
    Default: true
  EngineVersion:
    Type: String
    Default: '15.2'
  MasterUsername:
    Type: String
  MasterUserPassword:
    Type: String
    NoEcho: true
Resources:
  RDSPostgresSG:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupName: !Sub "${AWS::StackName}RDSSG"
      GroupDescription: Public Facing SG for our Cruddur ALB
      VpcId:
        Fn::ImportValue:
          !Sub ${NetworkingStack}VpcId
      SecurityGroupIngress:
        - IpProtocol: tcp
          SourceSecurityGroupId:
            Fn::ImportValue:
              !Sub ${ClusterStack}ServiceSecurityGroupId
          FromPort: 5432
          ToPort: 5432
          Description: ALB HTTP
  DBSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupName: !Sub "${AWS::StackName}DBSubnetGroup"
      DBSubnetGroupDescription: !Sub "${AWS::StackName}DBSubnetGroup"
      SubnetIds: { 'Fn::Split' : [ ','  , { "Fn::ImportValue": { "Fn::Sub": "${NetworkingStack}PublicSubnetIds" }}] }
  Database:
    Type: AWS::RDS::DBInstance
    DeletionPolicy: 'Snapshot'
    UpdateReplacePolicy: 'Snapshot'
    Properties:
      AllocatedStorage: '20'
      AllowMajorVersionUpgrade: true
      AutoMinorVersionUpgrade: true
      BackupRetentionPeriod: !Ref  BackupRetentionPeriod
      DBInstanceClass: !Ref DBInstanceClass
      DBInstanceIdentifier: !Ref DBInstanceIdentifier
      DBName: !Ref DBName
      DBSubnetGroupName: !Ref DBSubnetGroup
      DeletionProtection: !Ref DeletionProtection
      EnablePerformanceInsights: true
      Engine: postgres
      EngineVersion: !Ref EngineVersion
      MasterUsername:  !Ref MasterUsername
      MasterUserPassword: !Ref MasterUserPassword
      PubliclyAccessible: true
      VPCSecurityGroups:
        - !GetAtt RDSPostgresSG.GroupId
```

</details>

## CONFIGURING STEPS

1. Create DB Template file and script

```sh
cd /workspace/aws-bootcamp-cruddur-2023
mkdir -p  aws/cfn/db
cd aws/cfn/db
touch template.yaml config.toml.example config.toml
```

As I did with the networking-deploy script I modified the script to not have hardcoded values.

2. Create and Update DB Deploy Script `aws/cfn/db/template.yaml`

View the db template [code]((https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/aws/cfn/db/template.yaml))


3. Create `bin/cfn/db` script and make it executable.

```YAML
#! /usr/bin/env bash
set -e # stop the execution of the script if it fails

CFN_PATH="/workspace/aws-cloud-project-bootcamp/aws/cfn/db/template.yaml"
CONFIG_PATH="/workspace/aws-cloud-project-bootcamp/aws/cfn/db/config.toml"
echo $CFN_PATH

cfn-lint $CFN_PATH

BUCKET=$(cfn-toml key deploy.bucket -t $CONFIG_PATH)
REGION=$(cfn-toml key deploy.region -t $CONFIG_PATH)
STACK_NAME=$(cfn-toml key deploy.stack_name -t $CONFIG_PATH)
PARAMETERS=$(cfn-toml params v2 -t $CONFIG_PATH)

aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --s3-bucket $BUCKET \
  --s3-prefix db \
  --region $REGION \
  --template-file "$CFN_PATH" \
  --no-execute-changeset \
  --tags group=cruddur-db \
  --parameter-overrides $PARAMETERS MasterUserPassword=$DB_PASSWORD \
  --capabilities CAPABILITY_NAMED_IAM
```


4. Update config.toml with the following settings that specify the bucket, region and name of the CFN stack.

```toml
[deploy]
bucket = 'nwaliechinyere-cfn-artifacts'
region = 'us-east-1'
stack_name = 'CrdDb'

[parameters]
NetworkingStack = 'CrdNet'
ClusterStack = 'CrdCluster'
MasterUsername = 'cruddurroot'
```

5. Seed Deploy

Before seeding we need to update the value for `PROD_CONNECTION_URL` to our new database. I updated it in both Parameter Store and GitPod.

We need to update it both locations because a connection will be made by the application `/cruddur/backend-flask/CONNECTION_URL` in parameter store. The GitPod `PROD_CONNECTION_URL` needs to be updated to allow seeding.

Once `PROD_CONNECTION_URL` has been set correctly, seed the database with data by running the following.

`./bin/db/setup prod`

6. Creat CFN DDB Stack Script

- Create `.aws-sam` with `./bin/cfn/ddb-build`
- Package with `./bin/cfn/ddb-package`
- Create CFN stack with ths command `./bin/cfn/ddb-deploy`, in order to create CrdDdb stack.

The DDB table created now needs to be added to the following location `/aws/cfn/service/config.toml` and should look as below. Update the parameters for your domain and DDBMessageTable is obtained from the resources section of `CrdDdb`

```config
[deploy]
bucket = 'nwaliechinyere-cfn-artifacts'
region = 'us-east-1'
stack_name = 'CrdSrvBackendFlask'

[parameters]
EnvFrontendUrl = 'https://nwaliechinyere.xyz'
EnvBackendUrl = 'https://api.nwaliechinyere.xyz'
DDBMessageTable = 'CrdDdb-DynamoDBTable-<the digit and alphabet>'
```

Below is the Dynamodb Deployed stack after running  `./bin/cfn/db`

![Deployed CrdDb Cluster](assets/week11/cfn-stack/DeployedCrdDbCluster.png)

> *Execute the changeset*

---

### CFN Service Deploy Stack

**Create Service Template**

1. As I did with the networking-deploy script I modified the script to not have hardcoded values, and Updated config.toml with the following settings that specify the bucket, region and name of the CFN stack.

 > With all the pre-requisites in place the service stack script can now be created

2.  Create the cfn service deploy script, It make use of toml
   
```sh
#! /usr/bin/env bash
set -e # stop the execution of the script if it fails

CYAN='\033[1;36m'
NO_COLOR='\033[0m'
LABEL="CFN_NETWORK_DEPLOY"
printf "${CYAN}====== ${LABEL}${NO_COLOR}\n"

# Get the absolute path of this script
ABS_PATH=$(readlink -f "$0")
CFN_BIN_PATH=$(dirname $ABS_PATH)
BIN_PATH=$(dirname $CFN_BIN_PATH)
PROJECT_PATH=$(dirname $BIN_PATH)
CFN_PATH="$PROJECT_PATH/aws/cfn/networking/template.yaml"
CONFIG_PATH="$PROJECT_PATH/aws/cfn/networking/config.toml"

cfn-lint $CFN_PATH

BUCKET=$(cfn-toml key deploy.bucket -t $CONFIG_PATH)
REGION=$(cfn-toml key deploy.region -t $CONFIG_PATH)
STACK_NAME=$(cfn-toml key deploy.stack_name -t $CONFIG_PATH)

aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --s3-bucket $BUCKET \
  --s3-prefix networking \
  --region $REGION \
  --template-file "$CFN_PATH" \
  --no-execute-changeset \
  --tags group=cruddur-networking \
  --capabilities CAPABILITY_NAMED_IAM
```

3. Save this toml file in a bin directory here; `bin/cfn/service-deploy` and always make it executable e.g `chmod u+x`
   
4. Create toml config.toml and add the required variables.
```TOML
[deploy]
bucket = 'cfn-artifacts'
region = 'us-east-1'
stack_name = 'CrdNet'
```
5. Save the file in `aws/cfn/service/config.toml`
   
6. Deploy the template with this command `./bin/cfn/service` in your Gitpod or IDE terminal

7. Update `aws/cfn/service/template.yaml`

Place this entry under parameters

```yaml
  DDBMessageTable:
    Type: String
    Default: cruddur-messages
```

The following needs to be added to the `Environment:` section under `TaskDefinition:`

```yaml
            - Name: DDB_MESSAGE_TABLE
              Value: !Ref DDBMessageTable       
```

Execute `./bin/cfn/service-deploy` to update `CrdSrvBackendFlask` with the DDB entry.
   
8. Running `./bin/cfn/service-deploy` now initiates a changeset for the CFN stack.

![CFN sevice-deploy](assets/week10/network/cruddur.png)

---

### **Reference**

- [CFN Template basics YAML VS JSON](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/gettingstarted.templatebasics.html)
- [For ECS CloudFormation templates](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/quickref-ecs.html)
- [Paloalto Networks Policy as Code](https://www.paloaltonetworks.com/cyberpedia/what-is-policy-as-code#:~:text=Policy%2Das%2Dcode%20is%20the,enforcement%20tools%20you%20are%20using.)
- [Cloud security posture management](https://www.paloaltonetworks.com/cyberpedia/what-is-cloud-security-posture-management)
- [OWASP IaC Security Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Infrastructure_as_Code_Security_Cheat_Sheet.html)
- [NetDevOps modern approach to networking deployments](https://aws.amazon.com/fr/blogs/networking-and-content-delivery/netdevops-a-modern-approach-to-aws-networking-deployments/)

> *In case you want to convert an already provisioned resource to the was cloud formation stack with the current configuration use [this](https://former2.com/) or try this [link](https://github.com/sentialabs/cloudformer2) or this [link](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/validate-template.html)*

---

**Issues during this task**

For this task I had an issue with the Code Editor verifying my code. I tried debugging and searching through the bootcamp forum and found a solution, I had to make some changes to the Code Editor adding some yaml tags.

![image](yamlissue.png)
![image](yamlissuefixed.png)

---

> CloudFormation Part 2 in [Week Eleven](week11.md).
