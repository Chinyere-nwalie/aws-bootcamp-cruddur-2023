# Week 9 — CI/CD with CodePipeline, CodeBuild and CodeDeploy

- [Requirements](#Requirements)
- [Task Preparations ](#Task-Preparations)
- [Configuring CodeBuild](#configuring-codebuild)
- [Configuring CodePipeline](#configuring-codepipeline)
- [Troubleshooting](#troubleshooting)
- [Test Pipeline](#Test-Pipeline)
- [CI/CD Security Best Practices](CI/CD-Security-Best-Practices)
- [Issues journal and Summary](#Issues-journal-and-Summary)

## Requirements

Here's our Instructor Andrews Notes for week-9 : <https://github.com/omenking/aws-bootcamp-cruddur-2023/blob/week-9-again/journal/week9.md>

CI/CD means: Codes can easily deploy to production without the need to manually do it

The aim of this week was to automate building the backend-flask image with a build pipeline using CodeBuild and CodePipeline. This would provide us with a complete CI/CD pipeline, Read here for [Further Knowledge](https://aws.amazon.com/blogs/devops/complete-ci-cd-with-aws-codecommit-aws-codebuild-aws-codedeploy-and-aws-codepipeline/)

Prior to implementing the CI/CD pipeline, these scripts had to be run in the following order manually

1. Login to remote registry and generate environment variable using `bin/bootstrap` [bootstrap](<https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/bin/bootstrap>)
2. Build the image using `bin/backend/build` [build](<https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/bin/backend/build>)
3. Push the image to the ECR repository using `bin/backend/push` [push](<https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/bin/backend/push>)
4. Deploy a new task definition for the backend task and force it to deploy using `bin/backend/deploy` [deploy](<https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/bin/backend/deploy>)

![image](561)

While running these 4 scripts, missing one of the scripts would mean the latest image would not deploy. Also, if a shell script could be written to simplify this, it does not allow us to fully utilise the benefits of CI/CD.

## A new port was created 
![image](591)

**Integration**
Codebuild would be configured to detect any changes made in the prod branch of our repository.

**Deployment**
CodePipeline would then deploy the changes automatically.

---

## Task Preparations 

- Buildspec.yml - This needs to be created in backend-flask i.e `backend-flask/buildspec.yml` [buildspec.yml](<https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/backend-flask/buildspec.yml>)
- Policy for permissions required for codebuild to run successfully [policy-file](<https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/aws/ecr-permissions.json>)
- Prod branch in the repository. CodeBuild will detect any Pull requests; Create a new Branch called **prod** in your Bootcamp Github Repository, In your **main branch** for the Bootcamp, open a Gitpod workspace and do the following steps for week 9 tasks, in the end changes are committed to the main branch and then merged to the prod branch of [Week-9](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/tree/prod)

![image](521)

The deployment will work whether or not the cruddur application is running which means whether the cluster is on or not it will automatically use the latest image.

---

Some AWS services are used here, with CodePipeline as the central control point for managing the stages.


- **CodePipeline** is the main service of the CI/CD pipeline, co-ordinating the different stages and automating the release process.
- **CodeBuild** is integrated with ECR, the Amazon Elastic Container Registry, enabling the creation and management of container images. CodeBuild executes build processes, such as compiling code, running tests, and generating the container image that will be deployed.
- **CodeDeploy** This technology is attached to all stages of the pipeline and facilitates the smooth deployment of the application. It automates the process of rolling out new versions of the application, manages traffic routing, and provides rollback capabilities if issues arise.
- **S3 Bucket** CodeBuild and CodeDeploy leverage an S3 bucket to store artifacts, such as build output and deployment packages. This allows for easy access to these artifacts during the pipeline execution.


## Configuring CodeBuild

Create a new CodeBuild Project with the following options. **Everything else can be left as default**

### Project Configuration

| Option | Value |
| ----------- | ----------- |
| Project Name | cruddur-backend-flask-image |
| Build Badge | Enabled |

![create code-build project](529)

### Source

| Option | Value |
| ----------- | ----------- |
| Source Provider | Github |
| Repository | Repository in my GitHub account |
| GitHub repository | <https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023.git> |
| Connection status | Connect to GitHub using OAuth|
|Source version | prod |
|Webhook| Rebuild every time a code change is pushed to this repository|
|Build type|Single build|
|Required attributes|name,preferred_username|
|Event type |PULL_REQUEST_MERGED|

![Connect to GitHub using OAuth](530)
![Source-1-GitHub](533)
![Webhook-events](534)

### Environment

| Option | Value |
| ----------- | ----------- |
|Environment image|Managed image|
| Operating system | Amazon Linux 2 |
| Runtime(s) | Standard |
| Image | Latest **Currrently 4.0** |
| Image version | Always use the latest image for this runtime version |
| Environment type | Linux |
| Privileged | Check **Enable this flag if you want to build Docker images or want your builds to get elevated privileges** |
| Role name | codebuild-cruddur-backend-flask-image-service-role |

![image](536)

![image](537)

### Buildspec

| Option | Value |
| ----------- | ----------- |
| Build specifications | Use a buildspec file |
| Client secret | backend-flask/buildspec.yml |

![image](540)

### Artifacts

| Option | Value |
| ----------- | ----------- |
| Type | No artifacts |
| Client secret | backend-flask/buildspec.yml |

![image](541)

### Logs

| Option | Value |
| ----------- | ----------- |
| CloudWatch logs - optional | **Checked** |
| Stream name| backend-flask |

![image](542)

Once these options have been selected, click **Create Build Project**

![image](543)

After the successful creation of codebuild project, I copied the badge URL and pasted it in my chrome browser and it displayed `AWS odebuild`. I also pasted the badge URL in my Bootcamp Repository readme.MD file as instructed by Andrew our bootcamp Instructor

![image](557)

## Configuring CodePipeline

Create a new CodePipeline Project with the following options. **Everything else can be left as default**

### Pipeline settings

| Option | Value |
| ----------- | ----------- |
| Pipeline name | cruddur-backend-fargate |
| Service role | **Check** New Service role |
| Role name | AWSCodePipelineServiceRole-us-east-1-cruddur-backend-fargate |
| Allow AWS CodePipeline to create a service role so it can be used with this new pipeline | **Checked**|
| Advanced Settings |  |
| Artifact store| Default Location|
| Encryption key|Default AWS Managed Key|

![image](544)

### Add Source Stage

| Option | Value |
| ----------- | ----------- |
|Source provider| GitHub (Version 2) |
|Connection | Connect to GitHub |
|Source provider| GitHub (Version 2) **Click Connect To Github**|
|Connection name | cruddur |
|Repository name | Chinyere-nwalie/aws-bootcamp-cruddur-2023 |
|Branch name | prod |
|Connection name | cruddur |
|Change detection options | **Check** Start the pipeline on source code change |
|Output artifact format | CodePipeline default |

![image](545)
|
![image](546)
|
![image](547)
|
![image](548)
|
![image](549)
|
![image](550)
|
![image](551)
|
![image](552)

### Build

| Option | Value |
| ----------- | ----------- |
|Build provider| AWS CodeBuild |
|Region | Select Your Region |
|Project name| **Select existing project** cruddur-backend-flask-image|
|Build type | Single |

![image](555g)

### Deploy

| Option | Value |
| ----------- | ----------- |
|Deploy provider | Amazon ECS |
|Region | Select Your Region |
|Cluster name | cruddur |
|Service name | backend-flask |
|Output artifact format | CodePipeline default |

![image](553)

![image](554)

![image](556)

Click Next and **Create Pipeline**

This should create a pipeline which will automatically start running. If successful then nothing further needs to be done. If not then further troubleshooting needs to be carried out.

![image](660)

---

## Troubleshooting

### Builds failing when unable to download source

For my Build, It kept throwing timeout and wasn't successful. Also after committing my codes to trigger the build which I deleted was running for 45 minutes without progress

![image](564)

![image](567)

![image](563)

### No logs were visible when source was failing

![image](563)

![image](569)

### Troubleshooting showed builds were hanging at downloading source

![image](574)

### Misconfigured Environment

![image](538)

The Above pic showed that the environment had been misconfigured.

- VPC had been configured, this was not needed
- Security Groups had been configured
- Environment variables had been configured in the CodeBuild project. Andrew had configured this in his buildspec.yml; however, configuring it in the project had the same issue and was the main reason for the builds failing without logs.

### IAM Role required changing
Despite resolving this issue builds still failed. Logs showed the code build role was not authorized to perform the assigned tasks required to make it successful.

Remodification of the codebuild role

![image](584)

![image](583)

Create Inline Policy

![image](576)

### Add ecr-permissions to JSON Policy

The following permissions need to be applied to the role [policy-file](<<https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/aws/ecr-permissions.json>)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:CompleteLayerUpload",
        "ecr:GetAuthorizationToken",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart",
        "ecr:BatchGetImage",
        "ecr:GetDownloadUrlForLayer"
      ],
      "Resource": "*"
    }
  ]
}
```
![image](577)

![image](578)

### Builds run successfully once permissions have been granted

![image](580)

### Successful Text from log files

```sh
20 | [Container] 2023/10/04 17:54:27 Phase complete: DOWNLOAD_SOURCE State: SUCCEEDED
-- | --
21 | [Container] 2023/10/04 17:54:27 Phase context status code:  Message:
22 | [Container] 2023/10/04 17:54:27 Entering phase INSTALL
23 | [Container] 2023/10/04 17:54:27 Running command echo "cd into $CODEBUILD_SRC_DIR/backend"
24 | cd into /codebuild/output/src3549108726/src/github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/backend
25 |  
26 | [Container] 2023/10/04 17:54:27 Running command cd $CODEBUILD_SRC_DIR/backend-flask
27 |  
28 | [Container] 2023/10/04 17:54:27 Running command aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $IMAGE_URL
29 |  
30 | [Container] 2023/10/04 17:54:44 Entering phase BUILD
31 | [Container] 2023/10/04 17:54:44 Running command docker build -t backend-flask.
Sending build context to Docker daemon  84.99kB
32 |  
33 | [Container] 2023/10/04 17:55:05 Running command docker push $IMAGE_URL/$REPO_NAME
The push refers to repository [454949276804.dkr.ecr.us-east-1.amazonaws.com/backend-flask]
34 | [Container] 2023/10/04 17:55:11 Running command printf "[{\"name\":\"$CONTAINER_NAME\",\"imageUri\":\"$IMAGE_URL/$REPO_NAME\"}]" > imagedefinitions.json
35 | [Container] 2023/10/04 17:55:11 Phase complete: UPLOAD_ARTIFACTS State: SUCCEEDED
```
---

## Test Pipeline

Update `backend-flask/app.py` by changing the return in `health_check` function from `return {"success": True}, 200` to `return {"success": True, "ver": 1}, 200`.

![image](594)

Now merge this `week-9` branch to the `prod` branch. This will trigger the pipeline we created.

Go to `https://api.<domain_name>/api/health-check`, it will show `{"success":true,"ver":1}`.

Below is a screenshot that proofs my successful pipeline after merging pull request from `week-9`:

![image]()

![image]()


## CI/CD Security Best Practices

The following table summarizes more CI/CD security best practices for your reference.

| Best Practice               | Description                                                                                                                                 |
|-----------------------------:|---------------------------------------------------------------------------------------------------------------------------------------------|
| **Secure Configuration Management** | Use secure configuration management tools and practices to manage and version control the CI/CD pipeline configurations.                   |
|                             | Restrict access to configuration files and credentials, ensuring they are encrypted and stored securely.                                   |
|                             | Regularly review and update configurations to address security vulnerabilities.                                                             |
| **Secure Code Repository**        | Implement secure coding practices and perform regular code reviews to identify and fix security vulnerabilities.                           |
|                             | Utilize version control systems with strong access controls and authentication mechanisms.                                                |
|                             | Monitor the code repository for any unauthorized changes or malicious activity.                                                           |
| **Automated Security Testing**    | Integrate security testing tools, such as Static Application Security Testing (SAST) and Dynamic Application Security Testing (DAST).        |
|                             | Set up automated security tests to scan for common vulnerabilities and weaknesses in the application code and dependencies.               |
|                             | Ensure that security test results are automatically reported and tracked for further analysis.                                            |
| **Vulnerability Management**      | Utilize Software Composition Analysis (SCA) tools to identify and manage vulnerabilities in third-party libraries and components.             |
|                             | Regularly update and patch vulnerable dependencies to minimize the risk of exploitation.                                                  |
|                             | Establish a process for tracking and addressing security vulnerabilities, including timely communication and remediation.                 |


Adhering to the above practices is crucial to ensure the development and delivery of secure software, establishing a robust and efficient CI/CD security framework that minimizes risks and protects sensitive data.


## Issues journal and Summary

Week 9 task/Homework was completed successfully.

Builds would timeout and not proceed. An earlier build which I deleted kept running for 45 minutes without progressing. Investigation showed that the environment had been misconfigured.

- VPC had been configured, this was not needed
- Security Groups had been configured, again this was not needed.
- Environment variables had been configured in the CodeBuild project. Andrew had configured this in his buildspec.yml however configuring it in the project had the same issue and was the main reason why the builds had been failing without logs.

Once the above had been configured, builds would fail with permission errors.

Logs showed the CodeBuild role was not authorised to perform various tasks required to build successfully. The CodeBuild role had to be granted permission to perform build-related roles.

- Added this for a guide to unset your environment variables on Gitpod workspace just in case this would be helpful to someone
  - How to unset env vars in Gitpod
  ```sh
  gp env -u AWS_Environment_URL
  unset AWS_Environment_URL
  ```
  
- Also while I was commiting my codes to triggers when you save the code changes to code build & code pipeline, It returned a Git error stating there are divergent branches
  - Divergent branches mean a conflict of branches this occurred when I wanted to push a code to Github and that was because I was working on something on Github and didn't clear it before committing my codes on Gitpod hence it errored out conflict of branches. I resolved this by running it on my terminal
    ```sh
    git config pull.rebase false
    git pull
    git push
    ```
![image](565)
