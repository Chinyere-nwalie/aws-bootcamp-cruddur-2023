# Week 11/X — CloudFormation Part 2 - Cleanup

- [Week X Sync tool for static website hosting](#week-x-sync-tool-for-static-website-hosting)
    - [Pre-Requisites](#pre-requisites)
    - [Create Build scripts](#create-build-scripts)
    - [Create Sync Template](#create-sync-template)
- [Initialise Static Hosting](#initialise-static-hosting)
    - [Run Static-Build script](#run-static-build-script)
    - [Initialise Sync](#initialise-sync)
    - [Create GitHub Action](#create-github-action)
    - [Listing of S3 bucket](#listing-of-s3-bucket)
    - [Sync Executed](#sync-executed)
    - [Invalidation Created](#invalidation-created)
    - [Invalidation Details](#invalidation-details)
- [CFN CI/CD Stack](#cfn-cicd-stack)
    - [Create CI/CD Template](#create-cicd-template)
- [CFN MachineUser Stack](#cfn-machineuser-stack)
- [Troubleshooting](#troubleshooting)
      
---

## Week X Sync tool for static website hosting

### Pre-Requisites

- Publicly accessible bucket that was created via `./bin/cfn/frontend`
- Cloudfront distribution that was created via `./bin/cfn/frontend`

### Create Build scripts

Create the following scripts `static-build` and `sync` in `bin/frontend` and set them as executable

```sh
touch bin/frontend/static-build
touch bin/frontend/sync
chmod u+x bin/frontend/static-build
chmod u+x bin/frontend/sync
```

Create a new file `erb/sync.env.erb` that holds the environment variables for the `bin/frontend/sync` script

```sh
touch erb/sync.env.erb
```

Add the following, replace `SYNC_S3_BUCKET` and `SYNC_CLOUDFRONT_DISTRIBUTION_ID` with your own.

```erb
SYNC_S3_BUCKET=nwaliechinyere.xyz
SYNC_CLOUDFRONT_DISTRIBUTION_ID=E32MCTPMMZNR3
SYNC_BUILD_DIR=<%= ENV['THEIA_WORKSPACE_ROOT'] %>/frontend-react-js/build
SYNC_OUTPUT_CHANGESET_PATH=<%=  ENV['THEIA_WORKSPACE_ROOT'] %>/tmp/changeset.json
SYNC_AUTO_APPROVE=false
```

Create the following files in the root of the repository

- Gemfile
- Rakefile

```sh
touch Gemfile
touch Rakefile
```

The code for these files is located respectively here [Gemfile](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/Gemfile) and here [Rakefile](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/Rakefile).

Create the following file `./tmp/.keep` as a placeholder

```sh
touch tmp/.keep
```

Create a `sync` script in `bin/cfn`

```sh
touch bin/cfn/sync
chmod u+x bin/cfn/sync
```

Update `bin/cfn/sync` with the following [code](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/bin/cfn/sync)

### Create Sync Template

```sh
cd /workspace/aws-bootcamp-cruddur-2023
mkdir -p  aws/cfn/sync
touch aws/cfn/sync/template.yaml aws/cfn/sync/config.toml aws/cfn/sync/config.toml.example
```

Update config.toml with the following settings that specify the bucket, region and name of the CFN stack. Replace `bucket` and `region` with your own.

We also need to specify the GitHubOrg which in our case will correspond to our GitHub username and the GitHub Repository name

```toml
[deploy]
bucket = 'nwaliechinyere-cfn-artifacts'
region = 'nwaliechinyere.xyz'
stack_name = 'CrdSyncRole'

[parameters]
GitHubOrg = 'Chinyere-nwalie'
RepositoryName = 'aws-bootcamp-cruddur-2023'
OIDCProviderArn = ''
```

Update `aws/cfn/sync/template.yaml` with the following [code](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/aws/cfn/template.yaml)

### Initialise Static Hosting

**Run Static-Build script**

Run build script `./bin/frontend/build` , you should see output similar to the following when successful.

```console
The build folder is ready to be deployed.
You may serve it with a static server:

  npm install -g serve
  serve -s build

Find out more about deployment here:

  https://cra.link/deployment
```

Change to the frontend directory and zip the build folder

```sh
cd frontend-react-js
zip -r build.zip build/
```

The steps within the video recommended downloading the zip file locally and then uploading it to the s3 bucket. 

I verified everything had been zipped successfully before uploading in s3

![image](listsofbucketsinlaptop.png)

---

### Initialise Sync

In the root of the repository

- Install the pre-requisite ruby gems `gem install aws_s3_website_sync dotenv`
- Generate `sync.env` by running updated `./bin/frontend/generate-env`
- Initiate synchronisation './bin/frontend/sync'
- Create CFN Sync `CrdSyncRole` stack by running `./bin/cfn/sync`

Sync Executed
![image](newlycreatedsync.pmg)

Invalidation Created
![image](newsyncinvalidation.png)

Invalidation Details
![image](newsyncinvalidationsdetails.png)

### Create GitHub Action

Create folder in base of repo for action

```sh
mkdir -p .github/workflows/
touch .github/workflows/sync.yaml
```

Update with the following. Replace `role-to-assume` with the role generated in `CrdSyncRole` and `aws-region` with the region your stack was created in.

```yaml
name: Sync-Prod-Frontend

on:
  push:
    branches: [ prod ]
  pull_request:
    branches: [ prod ]

jobs:
  build:
    name: Statically Build Files
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [ 18.x]
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: cd frontend-react-js
      - run: npm ci
      - run: npm run build
  deploy:
    name: Sync Static Build to S3 Bucket
    runs-on: ubuntu-latest
    # These permissions are needed to interact with GitHub's OIDC Token endpoint.
    permissions:
      id-token: write
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Configure AWS credentials from Test account
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::797130574998:role/CrdSyncRole-Role-VW38RM6ZXJ6W
          aws-region: eu-west-2
      - uses: actions/checkout@v3
      - name: Set up Ruby
        uses: ruby/setup-ruby@ec02537da5712d66d4d50a0f33b7eb52773b5ed1
        with:
          ruby-version: '3.1'
      - name: Install dependencies
        run: bundle install
      - name: Run tests
        run: bundle exec rake sync
```

---

## CFN CI/CD Stack

### Create CI/CD Template

Create the folder structure.

```sh
cd /workspace/aws-bootcamp-cruddur-2023
mkdir -p  aws/cfn/cicd
cd aws/cfn/cicd
touch template.yaml config.toml
```

The CI/CD stack requires a nested codebuild stack so a directory needs to be created for it too.

```sh
cd /workspace/aws-bootcamp-cruddur-2023
mkdir -p  aws/cfn/cicd/nested
cd aws/cfn/cicd/nested
touch codebuild.yaml
```

Update the files with the following code.

- ["aws/cfn/cicd/template.yaml"](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/aws/cfn/cicd/template.yaml)
- ["aws/cfn/cicd/config.toml"](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/aws/cfn/cicd/config.toml)
- ["aws/cfn/cicd/nested/codebuild.yaml"](../aws/cfn/cicd/nested/codebuild.yaml)

`aws/cfn/cicd/config.toml` structure

```toml
[deploy]
bucket = 'nwaliechinyere-cfn-artifacts'
region = 'us-east-1'
stack_name = 'CrdCicd'

[parameters]
ServiceStack = 'CrdSrvBackendFlask'
ClusterStack = 'CrdCluster'
GitHubBranch = 'prod'
GithubRepo = 'Chinyere-nwalie/aws-bootcamp-cruddur-2023'
ArtifactBucketName = "codepipeline-nwaliechinyere-cruddur-artifacts"
BuildSpec = 'backend-flask/buildspec.yml'
```

---

## CFN MachineUser Stack

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
bucket = 'nwaliechinyere-cfn-artifacts'
region = 'us-east-1'
stack_name = 'CrdMachineUser'
```


3. **Create MachineUser Deploy Script**

```sh
cd /workspace/aws-bootcamp-cruddur-2023
mkdir -p  bin/cfn
cd bin/cfn
touch machineuser-deploy
chmod u+x machineuser-deploy
```

4. Update the script with the following [code](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/bin/cfn/machineuser)

Running `./bin/cfn/machineuser-deploy` now initiates a changeset for the CFN stack.

---

**NOTE**

I created a new script to automatically update uuid

Similar to the `update_cognito_user_ids` script used to update cognito uuid, being that I have created another user, I need a new script for updating uuid so I made a new script with the help of my bootcamp team mate. After pasting this while my container was running I then included this in both my `.gitpod.yml` script named `update-dev-uuid`

```sh
UPDATE public.users 
SET uuid = '2290b744-8381-4409-a3f2-f4c417a952de'
WHERE users.handle = 'nwalie chinyere';

UPDATE public.users 
SET uuid = 'ab7423df-5546-4974-8819-c283a90e8b78'
WHERE users.handle = 'cloudgeekchie';
```

---

## Troubleshooting

I modified the `kill=all` script

---

> Week X  [Final-Week](week12.md)
