 # Week 11 — CloudFormation Part 2 & Static website hosting

- [Pre-Requisites](#pre-requisites)
    - [Create Build scripts](#create-build-scripts)
    - [Create GitHub Action](#create-github-action)
- [Warnings being shown when running static build](#warnings-being-shown-when-running-static-build)
    - [Initialise Static Hosting](#initialise-static-hosting)
    - [Create CrdSync Template](#create-crdsync-template)
    - [Initialise CrdSync](#initialise-crdsync)
    - [Sync Executed](#sync-executed)
    - [All Invalidations Created](#all-invalidations-created)
    - [Static Website Hosting Summary for Frontend](#static-website-hosting-summary-for-frontend)
- [CFN CI/CD Stack](#cfn-cicd-stack)
    - [Create CI/CD Template](#create-cicd-template)
    - [Issues during CI/CD stack deployment](#issues-during-cicd-stack-deployment)
- [CFN MachineUser Stack](#cfn-machineuser-stack)
    - [Proof of Project For MachineUser Stack](#proof-of-project-for-machineuser-stack)
- [Troubleshooting and Cleanup part 1](#troubleshooting-and-cleanup-part-1)
      
---

## Pre-Requisites

- A publicly accessible bucket that was created via `./bin/cfn/frontend`
- Cloudfront distribution that was created via `./bin/cfn/frontend`
---

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


After all of these, I firstly deployed my frontend cfn stack, but it failed

![cfn-frontend](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(82).png/)

It failed because there wasn't a distribution because I didn't add a `rootbucket name`

![cfn-frontend](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(83).png/)

I added everything and deployed
![cfn-frontend](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(91).png/)


Create & Execute changeset is completed now

![cfn-frontend](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(105).png/)

View my distribution

![cfn-frontend](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(106).png/)

---

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
          role-to-assume: arn:aws:iam::454949276804:role/CrdSyncRole-Role-KLklk0hE7GXn
          aws-region: us-east-1
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

## Warnings being shown when running static build

![warning for static-build](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(369).png/)

These were addressed by commenting out the following import line, and editing the pages provided in the warning details

`import ReactDOM from 'react-dom';`

Syncing  was a success

![CrdSync](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(137).png/)


Initializing static-build-script again

![CrdSyncRole](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(116).png/)

Invalidations created
![CrdSyncRole](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(138).png/)

![CrdSyncRole](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(139).png/)

---


### Initialise Static Hosting

- Run Static-Build script

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

![zip for static-build](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(126).png/)

![zip for static-build](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(127).png/)

![zip for static-build](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(128).png/)


All nwaliechinyere-cfn-artifacts objects in the bucket

![nwalie chinyere artifacts objects](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(833).png/)


---


### Create CrdSync Template

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

---


### Initialise CrdSync

In the root of the repository

- Install the pre-requisite ruby gems `gem install aws_s3_website_sync dotenv`
- Generate `sync.env` by running updated `./bin/frontend/generate-env`
- Initiate synchronisation './bin/frontend/sync'
- Create CFN Sync `CrdSyncRole` stack by running `./bin/cfn/sync`

dotenv installed

![CrdSyncRole](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(130).png/)

CFN sync refused to create and this was the error message, I rectified this by adding my repository name in the sync template file

![CrdSyncRole](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(145).png/)

I ran the cfn-toml parameter to see the workspace again before deploying

![CrdSyncRole](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(146).png/)

![CrdSyncRole](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(147).png/)


### Sync Executed
![CrdSyncRole](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(151).png/)

![CrdSyncRole](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(150).png/)


I gave the CrdSyncRole permission

![CrdSyncRole](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(156).png/)


### All Invalidations Created

![invalidations](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(852).png/)


### Static Website Hosting Summary for Frontend;

We use a Ruby-based tool to sync a folder from local development to S3 bucket, and then invalidate the CloudFront cache.

We created the following scripts:

- `./bin/frontend/static-build` and `./bin/frontend/sync`
- `./erb/sync.env.erb` change `SYNC_S3_BUCKET` to your own and that of `SYNC_CLOUDFRONT_DISTRIBUTION_ID`
- `./tmp/.keep` as a placeholder
- `Gemfile`
- `Rakefile`
- `./bin/cfn/sync`

We initialized the static hosting by uploading the frontend to the S3 bucket, the following were done below:

- run `./bin/frontend/static-build`
- `cd frontend-react-js` then `zip -r build.zip build/`
- download and decompress the zip, and upload everything inside the build folder to s3://beici-demo.xyz

For syncing:

- Install by `gem install aws_s3_website_sync dotenv`
- Run `./bin/frontend/generate-env` to generate `sync.env`
- Run `./bin/frontend/sync` to sync
- Run `./bin/cfn/sync` to create stack `CrdSyncRole`, add the permissions by creating an inline policy `S3AccessForSync` for the created `CrdSyncRole` with S3 service, actions of GetObject, PutObject, ListBucket, and DeleteObject, resources specific to the bucket `nwaliechinyere.xyz`, and resource with the same bucket and any object.

And if changes are been made to the frontend  we can always should sync by running `./bin/frontend/static-build` and then `./bin/frontend/sync`.

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

![Nested stack](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(85).png/)

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

Creating the s3 bucket for CICD
![cicd bucket](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(52).png/)

After I ran cicd deploy in my Gitpod CLI, I went to my AWS to view the status, the creation was complete

![cicd deploy](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(52).png/)

But when I executed changesets, it was throwing errors

![cicd deploy](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(56).png/)

Our Instructor Andrew brown rectified this issue by changing `version` from 2

![cicd deploy](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(78).png/)

To `1`

![cicd deploy](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(111).png/)

Then I deployed the stack again via CLI

![cicd deploy](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(68).png/)

It deployed successfully

![cicd deploy](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(67).png/)

![cicd deploy](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(84).png/)

Yet It was still failing on codepipeline

![cicd deploy](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(71).png/)

---

### Issues during CI/CD stack deployment

Anytime the backend is updated, it triggers CICD, then we merge this branch to the prod branch. Since the frontend is also updated, we can sync by running ./bin/frontend/static-build and then ./bin/frontend/sync.

Before I add any updates to merge to prod branch, I updated the `pending connection`

![cicd stack](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(73).png/)

Connected my repository which was a success;

![cicd stack](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(76).png/)

![cicd stack](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(77).png/)

I made an update to be pushed and merged to prod branch to see if cicd pipeling works completely

![cicd stack](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(229).png/)

It did but failed on build 

![cicd stack](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(231).png/)

Saying `access denied` our instructor said this is because in Github; there's No Branch [prod] found for FullRepositoryName [aws-bootcamp-cruddur-2023]` at the Build stage

![cicd stack](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(244).png/)


To resolve this change the following setting `GithubRepo` in `aws/cfn/cicd/config.toml` to include the account name e.g

`GithubRepo = 'Chinyere-nwalie/aws-bootcamp-cruddur-2023'`

I tried to build again

![cicd stack](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(247).png/)


Build succeeded after updating concerning code build and buildspec.yml

![cicd stack](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(248).png/)

![cicd stack](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(246).png/)

Build & Deploy was a success

![cicd stack](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(249).png/)

---

## CFN MachineUser Stack

A Machine User: generally refers to a user account or identity used for automated processes or machine-to-machine communication. It's often associated with tasks performed by scripts, applications, or services rather than interactive human users. 
The "CFN MachineUser Stack" was created to manage resources related to a machine user (In our Cruddur CFN machine user template automatically created a machine user in IAM and gave it a role). CFN MachineUser Stack creation could include the provisioning of IAM (Identity and Access Management) roles, policies, or other resources associated with a machine user account.

### Here are some possible reasons why this stack was created:

- Automation: The stack was part of an automated process for setting up machine user accounts in our Cruddur app and its associated resources.

- Security Policies: The stack defined IAM policies and roles with the least privilege principle, ensuring that the machine user has only the necessary permissions.

- Consistency: By using CloudFormation, we ensured that the creation and management of machine user resources were consistent and reproducible.

**Note** In terms of Scalability for your future application: If you have multiple machine users or need to scale resources based on demand, CloudFormation allows you to manage the infrastructure in a scalable way.

---
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

### Proof of Project For MachineUser Stack

Creating MachineUser Stack via CLI
![MachineUser Stack](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(498).png)

![MachineUser Stack](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(500).png)

A Machine user stack IAM was created and assigned
![MachineUser Stack](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(520).png)

MachineUser stack AccessKeys
![MachineUser Stack](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(532).png)

Refer to this [MachineUser](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/commit/d6647f96e866c36ad882458faa9ece5c28730f33) commit message as proof

---

## Troubleshooting and Cleanup part 1

Another issue I was faced with was the fact that when I deleted my main user in Cognito, while signing-in I mistakenly gave spacing in the username I wrote it as `nwalie chinyere` instead of `nwaliechinyere`, and in SQL you don't leave spacing in name. In my research, it said Leaving a space in a username in SQL is generally not recommended, While some database systems may allow it, unfortunately, mine didn't allow it, hence it was throwing errors in my username on my production link URL as `@nwalie%20chinyere` and unknowingly because of this issues I didn't know how to solve it so I kept signing in my main handle multiple times on Local database instead of my production. In the pic below look closely and see that the url is altered
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(223).png)

My app was lagging and then shows blank, I had to check my users in local database and figured they were multiple
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(209).png)

I connected to my local database in my terminal with the `./bin/db-connect` code to delete users. I used this code to delete
```sh
DELETE FROM your_table_name
WHERE your_condition_column = your_condition_value;
```
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(257).png)

I modified the [kill=all](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/backend-flask/db/kill-all-connections.sql) script

Then I killed all connections, ran the [setup](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/bin/db/setup) to drop & create a database

![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(315).png)

![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(313).png)

A boot camper helped me in creating this [update.sql](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/backend-flask/db/sql/users/update.sql) script to;
```sh
UPDATE public.users
    SET uuid = <PROD_UUID>
    WHERE
      users.handle = <USER_HANDLE>;
```
- I Pasted this code below manually in my `db-connection` on my terminal to update the users to that of mine
```sh
UPDATE public.users 
SET uuid = 'mu uuid'
WHERE users.handle = 'nwaliechinyere';

UPDATE public.users 
SET uuid = 'new user uuid'
WHERE users.handle = 'cloudgeekchie';
```
It's was Updated!
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(260).png)

This time I created a new user and sign-in in my production, my username didn't have a space, below is the clear URL without `%`
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(307).png)

I also modified the timestamp in my files and that of my local connection database so whenever I crud the timing is correct
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(304).png)

Old timing which was wrong
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(213).png)

The timing now is accurate. 
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(327).png)

These are the [time stamp & killall](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/commit/105ce8f0c1d34dd7f1579df723a853e3d35b426d) , [time stamp & killall 2](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/commit/b306b219bfec1ec97c896c97165f2cf1bb28aaf4) commit messages

My CSS in my app was breaking, I got help from the discord forum to  `add: #000 in background in .activity_feed in ActivityFeed.css file`

![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(274).png)

Which is this;
```sh
.activity_feed {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  background: #000 
}
```
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(275).png)

Cruds in my terminal on local database connection corresponding to the rectified CSS cruds
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(273).png)

In the final week before clean up, my Cruddur display picture in the Local container wasn't showing, till I debugged and figured I had to change the `Access-control-allow-origin` in my Cruddur-Avatar-Upload `Headers` to that of my current Gitpod workplace URL in my lambda for it to reflex.
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(795).png)

I had created an Access key before for the machine user stack, but I only input the access key ID in the parameter store and  didn't input the secret access key, so I created another one again because my app wasn't working
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(798).png)

Putting the access key ID value and that of the Secret Access Key too
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(799).png)

The parameter store has successfully updated both
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(800).png)

---

Next:
> Week X  [Final-Week](week12.md)
