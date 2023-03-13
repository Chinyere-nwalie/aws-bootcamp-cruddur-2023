# Week 0 — Billing and Architecture

# Install and verify AWS CLI

* I installed AWS CLI in my Gitpod account with these commands

```
url "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```
* I configured the required environment variables into my Gitpod. I also created credentials in my aws/IAM account for the course of this bootcamp using the AWS console
``
"export AWS_ACCESS_KEY_ID" 
"export AWS_SECRET_ACCESS_KEY"
"export AWS_DEFAULT_REGION"
``

* I accomplished these:
- Set my IAM user
- Went to Security Credentials
- Created ACCESS KEY

* This was where I figured informations in my environment variables, then i set it in my Gitpod account.

I set the environment variables with the help of this commands:

```
export AWS_ACCESS_KEY_ID=ACCESSKEYID
export AWS_SECRET_ACCESS_KEY=MYSECRETKEY
```
Then i checked my identity in my aws account console if it's properly configured.

```
aws sts get-caller-identity 
```
The output of the command to prove I am using this account:

![AWS ACCOUNT IAM/CLI](assets/IAM%20role.jpg)

To use AWS CLI in Gitpod I have to save my environment variables in my Gitpod safely. I used these commands in my terminal:
```
gp env AWS_ACCESS_KEY_ID=MyAccessID
gp env AWS_SECRET_ACCESS_KEY=MySecretKey
```

* Prepared for creating budget

To create budget in AWS I created environment variable which is my account ID this was executed with these commands:
```
gp env AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
```

# I Created two billing alarms

* I set up two billing alarm using cloud watch.

![MY BILLINGLARM](assets/cloud%20watch%20alarms.png)

# I Created two budgets

In order to create the budget alarm:
- I Create SNS topic
- I Subscribe to SNS topic
- I Create Budget Alarm

I used this as a vital instruction guide. [link](https://docs.aws.amazon.com/cli/latest/reference/sns/create-topic.html)

#To Subscribe SNS Topic

I attached an Email ID with these commands;

```
aws sns subscribe \
--topic-arn="arn:aws:sns:us-east-1:2*FAKE_ARN*808:BUDGET_TOPIC" \
--protocol=email \
--notification-endpoint=nirav@cloudjourney.in
```

After that I received an email below is the proof

![EMAIL](assets/sns-topic.png)

![BILLING-BUDGET](assets/billing-budgets.png)

I used this as a vital instruction guide.[link](https://docs.aws.amazon.com/cli/latest/reference/sns/subscribe.html)


# Architecture Diagrams

- I Created Conceptual diagram of Crudder

![Conceptual Diagram](assets/conceptual%20diagram.png)

Here is my [link of lucid chart](https://lucid.app/lucidchart/6933e61b-893c-419c-9e6b-6a643e716f22/edit?viewport_loc=-787%2C-49%2C2406%2C897%2C0_0&invitationId=inv_11635ac9-4931-4c0f-817a-a6dfed0f6b58)

- I Created a diagram of Crudder app

![CruddurDiagram](assets/cruddur%20diagram.png)

Here is my [link of lucid chart](https://lucid.app/lucidchart/1f56cd97-0de9-4e8b-b04a-466ef53dd988/edit?viewport_loc=-1283%2C-1876%2C4399%2C1641%2C0_0&invitationId=inv_bedbe3f8-d7aa-4586-8054-40722e6271a0)


# Homework Challenges

  - AWSEventbridge
   I created a rule to hook up the Health Dashboard to SNS and send notification when there is a service health issue. I was able to accomplish this task through the instructions in this link [here.](https://docs.aws.amazon.com/health/latest/ug/cloudwatch-events-health.html)
   
   ![AWSEventBridge](assets/aws%20health%20rule.jpg) 
   
  - I opened a support ticket for my EC2 instance
  I opened a suppoprt ticket. I was able to accomplish this task through the instructions in this link [here.](https://docs.aws.amazon.com/awssupport/latest/user/create-service-quota-increase.html) My request is still pending approval.
  
  ![Support ticket](assets/aws%20support%20ticket.png) 
    
  
  - AWS Credits
   I received a $100 credit from the Mongodb AWS Marketplace event. 
 ![AWS Credits](assets/aws%20credits.png)

