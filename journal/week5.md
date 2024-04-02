# Week 5 — DynamoDB and Serverless Caching

- [Data Modelling](#data-modelling)
- [Dynamodb Security](#Dynamodb-Security)
- [Backend Preparation](#backend-preparation)
- [DynamoDB Utility Scripts](#dynamodb-utility-scripts)
- [Implement Conversations with DynamoDB Local](#implement-conversations-with-dynamodb-local)
- [Errors](#Errors)
- [Implement DynamoDB Stream with AWS Lambda](#implement-dynamodb-stream-with-aws-lambda)

## Data Modelling

Data modelling called single table design is a data modelling technique that stores all related data in a single database table. In Dynamodb, we are doing a direct Messaging System in our Cruddur application. A list of messages that are a part of a message group are visible to users. Data access can be divided into four patterns:

1. Pattern A for showing messages. Users can see a list of messages that belong to a message group.
 
2. Pattern B for showing message groups. Users can see a list of message groups so they can check the other persons they have been talking to.
 
3. Pattern C for creating a new message in a new message group.
 
4. Pattern D for creating a new message in an existing message group.

- Uses
For displaying message groups, use Pattern B. 

For composing a fresh message in a fresh message group, use Pattern C. 

For adding a new message to an existing message group, use Pattern D.


- There are 3 types of items to put in dynamoDB table.

```python
my_message_group = {
    'pk': {'S': f"GRP#{my_user_uuid}"},
    'sk': {'S': last_message_at},
    'message_group_uuid': {'S': message_group_uuid},
    'message': {'S': message},
    'user_uuid': {'S': other_user_uuid},
    'user_display_name': {'S': other_user_display_name},
    'user_handle':  {'S': other_user_handle}
}

other_message_group = {
    'pk': {'S': f"GRP#{other_user_uuid}"},
    'sk': {'S': last_message_at},
    'message_group_uuid': {'S': message_group_uuid},
    'message': {'S': message},
    'user_uuid': {'S': my_user_uuid},
    'user_display_name': {'S': my_user_display_name},
    'user_handle':  {'S': my_user_handle}
}

message = {
    'pk':   {'S': f"MSG#{message_group_uuid}"},
    'sk':   {'S': created_at},
    'message': {'S': message},
    'message_uuid': {'S': message_uuid},
    'user_uuid': {'S': my_user_uuid},
    'user_display_name': {'S': my_user_display_name},
    'user_handle': {'S': my_user_handle}
}
```

- Backend Activities

I restructured the bash scripts with 3 folders having the utility commands for PSQL. Here are 3 folders storing utility commands for Postgres database.

DynamoDB (`backend-flask/bin/db`), 

AWS RDS (`backend-flask/bin/rds`),

AWS Cognito (`backend-flask/bin/cognito`).

I added `boto3` into `backend-flask/requirements.txt`, which is the AWS SDK for Python to create, configure, and manage AWS services like dynamoDB. I also added a command in `.gitpod.yml`  allowing gitpod to install python libraries automatically whenever a new workspace is launched.


- For the local Postgres database I did the following:

Update seed data in `backend-flask/db/seed.sql` to have 3 users and 1 activity. Setting one user as one you used for cruddur signin to avoid errors.

Created `backend-flask/bin/cognito/list-users` to list users data saved in AWS Cognito.

Created `backend-flask/bin/db/update_cognito_user_ids` to update users in the seed data.

Set `CONNECTION_URL: "postgresql://postgres:password@db:5432/cruddur"` in `docker-compose.yml`, because this week we are working with the users data queried from the local Postgres database named `cruddur`.

Added `python "$bin_path/db/update_cognito_user_ids"` to run `backend-flask/bin/db/update_cognito_user_ids`


- I  also manually updated a cognito ID for another users; `bayko` and for `londo` by the following commands:

```sh
./bin/db/connect
UPDATE public.users SET cognito_user_id = 'f73f4b05-a59e-468b-8a29-a1c39e7a2222' WHERE users.handle = 'bayko';


UPDATE public.users SET cognito_user_id = 'f73f4b05-a59e-468b-8a29-a1c39e7a1111' WHERE users.handle = 'londo';
```

![UUID](assets/Week%205%20UUID.jpg)

![UUID](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(450).png)

![UUID](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(451).png)

![UUID](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(262).png)

## DynamoDB Utility Scripts

- In this section, I created the following utility scripts to easily setup and remove dynamodb data in the `backend-flask/bin/ddb/` directory.

`schema-load` create a table named `cruddur-messages` either for DynamoDB local or on the AWS.

`list-tables`list the name of tables we created.

![List-tables](assets/Week%205%20list-tables.png)


`drop` drop a table by its name, e.g. `drop cruddur-messages`
`seed` load the seed data into the table `cruddur-messages` with hard-coded `message_group_uuid` To avoid potential data conflict, I replaced `my_handle` from `andrewbrown` to `nwaliechinyere`; Plus, `created_at` was set back a couple of hours so that seed messages are not created for the future time.

![dynamodb-seed](assets/Week%205%20dynamodb%20seed.png)

`scan`  scan all the items saved in the table `cruddur-messages`
`patterns/get-conversation`  list messages associated with the hard-coded `message_group_uuid` and print the consumed capacity.

![get-conversations](assets/Week%205%20get-conversations.png)

`patterns/list-conversations` list message groups and print the consumed capacity. This script uses functions from `backend-flask/lib/db.py`, which needs to always be updated.

Most times when I Login my cruddur app, I am faced with this error;

![psyscop-error](assets/Week%205%20pyscog%20pool%20error.png)

So, I run `./bin/db/setup/` 

`./bin/ddb/drop cruddur-messages`

`./bin/ddb/schema-load`

`./bin/ddb/seed` 

This is to actually load the seed data into our local dynamoDB and then the error is cleared.


- Example of list-conversations
 
`./bin/ddb/patterns/list-conversations` returns:

```sh
  SQL STATEMENT-[value]------

    SELECT
      users.uuid
    FROM users
    WHERE
      users.handle =%(handle)s
   {'handle': 'nwaliechinyere'}

my-uuid: ---------------------------

{
  "ConsumedCapacity": {
    "CapacityUnits": 0.5,
    "TableName": "cruddur-messages"
  },
  "Count": 1,
  "Items": [
    {
      "message": {
        "S": "this is a filler message"
      },
      "message_group_uuid": {
        "S": "5ae290ed-55d1-47a0-bc6d-fe2bc2700399"
      },
      "pk": {
        "S": "GRP#--------------------------"
      },
      "sk": {
        "S": "**********"
      },
      "user_display_name": {
        "S": "nwalie chinyere"
      },
      "user_handle": {
        "S": "bayko"
      },
      "user_uuid": {
        "S": "-------------"
      }
    }
  ],
  "ResponseMetadata": {
    "HTTPHeaders": {
      "content-length": "447",
      "content-type": "application/x-amz-json-1.0",
      "date": "SAT, 11 JAN 2023 00:00:00 GMT",
      "server": "Jetty(9.4.48.v20220622)",
      "x-amz-crc32": "-----",
      "x-amzn-requestid": "----------"
    },
    "HTTPStatusCode": 200,
    "RequestId": "--------------------
    "RetryAttempts": 0
  },
  "ScannedCount": 1
}
```


## Implement Conversations with DynamoDB Local

Firstly, create `backend-flask/lib/ddb.py` which creates `class Ddb` -> ALSO <- Set `AWS_ENDPOINT_URL: "http://dynamodb-local:8000"` in `docker-compose.yml`.

I changed and Updated/create routes and functions in the backend as instructed by Andrew Brown. This is to get messages and message groups from Dynamodb instead it being hard-coded. Changing `handle` TO `message_group_uuid` These implementations mainly use `list_message_groups` and `list_messages` of the `Ddb` class:


- I replaced codes in;

`backend-flask/app.py` (mainly, instead of using `"/api/messages/@<string:handle>"`, use `"/api/messages/<string:message_group_uuid>"`)

`backend-flask/services/message_groups.py`

`backend-flask/services/messages.py`


- I created and changed codes in;

Created `backend-flask/db/sql/users/uuid_from_cognito_user_id.sql`

Changed `backend_url` from using `${handle}` to `${params.message_group_uuid}` in `frontend-react-js/src/pages/MessageGroupPage.js`

Changed path from `"/messages/@:handle"` to `"/messages/:message_group_uuid"` in `frontend-react-js/src/App.js`

Change `params.handle` to `params.message_group_uuid` and `props.message_group.handle` to `props.message_group.uuid` in `frontend-react-js/src/components/MessageGroupItem.js`


- Updated & Created codes in the frontend file:

created `frontend-react-js/src/lib/CheckAuth.js` 

`frontend-react-js/src/pages/HomeFeedPage.js`

`frontend-react-js/src/pages/MessageGroupPage.js`

`frontend-react-js/src/pages/MessageGroupsPage.js`

`frontend-react-js/src/components/MessageForm.js`

Updated the content for `body` in `frontend-react-js/src/components/MessageForm.js`

Updated function `data_create_message` in `backend-flask/app.py`

Updated `backend-flask/services/create_message.py` 

Created `backend-flask/db/sql/users/create_message_users.sql`

Imported `MessageGroupNewPage` from `./pages/MessageGroupNewPage` and add the corresponding router in `frontend-react-js/src/App.js`

Created `frontend-react-js/src/pages/MessageGroupNewPage.js`

Created `frontend-react-js/src/components/MessageGroupNewItem.js`

Add the endpoint and function for user short in `backend-flask/app.py`

Created `backend-flask/services/users_short.py`

Created `backend-flask/db/sql/users/short.sql`

Updated `frontend-react-js/src/components/MessageGroupFeed.js`

Updated `frontend-react-js/src/components/MessageForm.js`

I completed the above steps.

## Errors

I was faced with multiple errors

![messaging-error](assets/week%205%20Messaging%20error.png)

In the above picture, I wasn't able to see conversations with bayko, and if i post a message, it wouldn't appear in my handle.

![inspect-error](assets/week%205%20Inspect%20error.png)

In the above picture, I inspected my page, and found out the reason for all of these errors including my messages disappearing was because there was a bug in my code. This error was successfully rectified by correcting a mispelt word in my codes, and I assigned bayko as a users in my cognito console making it 2 users.

![none-object-error](assets/week%205%20None%20Object%20Error.png)

In the above picture, this was a reoccuring error. All of these errors got me stucked for good two weeks. I checked and cross-checked, restarted my Gitpod environment to solve this error which i did, by editing my codes and tackling indentation errors.

Finally it worked!

![pattern-D](assets/week%205%20Pattern%20D.png)

To specifically see theses messages types this in your browser `https://<frontend_address>/messages/new/<handle>` To create and update new messages in a new message group with Bayko or londo (set the url handle to `bayko`-> OR <- `londo`)

## Implement DynamoDB Stream with AWS Lambda

- Working in the AWS console using dynamoDB, I added a trigger to execute a Lambda function which can trackes errors and monitor functions in the dynamoDB stream.

I Commented the  `AWS_ENDPOINT_URL` in `docker-compose.yml`, then compose up and run `./bin/db/setup`

Updated `./bin/ddb/schema-load` with a Global Secondary Index (GSI) and run `./bin/ddb/schema-load prod`, Which created a dynamoDB table named `cruddur-messages` This was created in my AWS console.

On AWS in DynamoDB > Tables > cruddur-messages > Turn on DynamoDB stream, choose "new image"

On AWS in the VPC console, create an endpoint named `cruddur-ddb`, choose services with DynamoDB, and select the default VPC and route table.

On AWS in the Lambda console, create a new function named `cruddur-messaging-stream-1` and enable VPC in its advanced settings; deploy the code as seen in `aws/lambdas/cruddur-messaging-stream.py`; add permission of `AWSLambdaInvocation-DynamoDB` to the Lambda IAM role; more permissions can be added by creating inline policies as seen in `aws/policies/cruddur-message-stream-policy.json`

On AWS in the DynamoDB console, create a new trigger and select `cruddur-messaging-stream-1`

At first the messages tab was blank, because there is no data in our AWS DynamoDB. I created a new message in a new message group with Bayko with this URL `https://<frontend_address>/messages/new/bayko` and it was working!

![dynamodb-conversations](assets/week%205%20Dynamodb%20conversations.png)

Everything worked fine, there was no error observed on AWS in CloudWatch > Log groups.

![dynamodb-stream](assets/week%205%20Dynamodb%20stream.png)

![week 5 last](assets/Week%205%20last.png)


## Dynamodb Security

- According to Ashish's video on dynamodb security best practices;

Amazon dynamodb should only be In the AWS region that you are legally allowed to be holding user data in.

AWS Cloud-Trail is enabled and monitored to trigger alerts on malicious dynamodb behaviour by an identity in AWS.

Use VPC Endpoints to create a private network from your application or lamda to a dynamodb. This helps prevent unauthorized access to your instance from the public internet.

Dynamodb uses appropriate authentication e.g IAM Roles/AWS Cognito Identity Pool to avoid IAM Users/Groups.

Add an amazon dynamodb accelerator (DAX) to improve the response time of the dynamodb linked to a web-application in AWS.

---

Next:
> Week 6 [Deploying Containers](week6.md)
