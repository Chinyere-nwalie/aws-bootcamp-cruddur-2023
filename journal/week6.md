# Week 6 — Deploying Containers
- [ECS Security Best Practices](#ECS-Security-Best-Practices)
-[ECS Fargate Frontend and Backend](#ECS Fargate Frontend and Backend)
-[Implementation of the SSL and configuration of Domain from Route53](#Implementation of the SSL and configuration of Domain from Route53)
-[Securing Backend flask](#Securing Backend flask)
-[Fixing Check Auth Cognito](#Fixing Check Auth Cognito)
-[Implementation of Xray on Ecs and Container Insights](#Implementation of Xray on Ecs and Container Insights)

## ECS Security Best Practices

Choose the right public or private ECR for images

AWS ECR scan images to 'scan on push' using basic or enhanced (inspector + snyk)

AWS fargate cannot run traditional security agents in fargate.

AWS fargate users can run unverified container images.

AWS fargate has no visibility of infrastructure.

AWS fargate containers can run as root and even with elevated priviledges.

## ECS Fargate Frontend and Backend

1) Create a db test script to check if we can estabilish a connection with the RDS

run -> backend-flask/bin/db/test

```sh
#!/usr/bin/env python3

import psycopg
import os
import sys

connection_url = os.getenv("PROD_CONNECTION_URL")

conn = None
try:
  print('attempting connection')
  conn = psycopg.connect(connection_url)
  print("Connection successful!")
except psycopg.Error as e:
  print("Unable to connect to the database:", e)
finally:
  conn.close()

```

2) Create a health check in the backend-flask container
adding the following code inside the app.py and removing the rollbar test

```sh
@app.route('/api/health-check')
def health_check():
  return {'success': True}, 200
```

3) Create a new bin script on backend-flask/bin/flask/health-check

```sh
#!/usr/bin/env python3

import urllib.request

try:
  response = urllib.request.urlopen('http://localhost:4567/api/health-check')
  if response.getcode() == 200:
    print("[OK] Flask server is running")
    exit(0) # success
  else:
    print("[BAD] Flask server is not running")
    exit(1) # false
# This for some reason is not capturing the error....
#except ConnectionRefusedError as e:
# so we'll just catch on all even though this is a bad practice
except Exception as e:
  print(e)
  exit(1) # false
```
---image-----

4) Create the cloudwatch log group with the following command running the codes in the terminal
```sh
aws logs create-log-group --log-group-name "/cruddur/fargate-cluster"
aws logs put-retention-policy --log-group-name "/cruddur/fargate-cluster" --retention-in-days 1
```

5) Create the container registry the images and we are creating this cluster in the aws CLI

```sh
aws ecs create-cluster \
--cluster-name cruddur \
--service-connect-defaults namespace=cruddur
```

6) Prepare docker; Create 3 repo in ECR. Python, backend-flask and frontend-react-js

First we need to login to ECR using the following command (Note this has to be done everytime you need to connect to ECR eventually at some point we set a script for it)
```sh
aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com"

```
--image--

we created the python repo using the CLI
```sh
aws ecr create-repository \
  --repository-name cruddur-python \
  --image-tag-mutability MUTABLE
```

and run the following command using the CLI to set the url of the repo 
```sh
export ECR_PYTHON_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/cruddur-python"
echo $ECR_PYTHON_URL
```

this command pulled the python:3.10-slim-buster, tag the image and push to the repo in ECR
```sh
docker pull python:3.10-slim-buster
docker tag python:3.10-slim-buster $ECR_PYTHON_URL:3.10-slim-buster
docker push $ECR_PYTHON_URL:3.10-slim-buster
```
--image-- 

we changed the following line of code in the dockerfile of backend-flask.
```
FROM python:3.10-slim-buster

ENV FLASK_ENV=development
````
with
```
FROM 238967891447.dkr.ecr.eu-west-2.amazonaws.com/cruddur-python

ENV FLASK_DEBUG=1
```

- to ensure it works, try to do Compose Up 
- to remove an image use the following code `docker image rm nameoffile:tag`
- to check the images of docker use `docker images`

7) Create the repo for the backend flask using the codes in the CLI
```sh
aws ecr create-repository \
  --repository-name backend-flask \
  --image-tag-mutability MUTABLE
```

run the following command using the CLI to set the url of the repo created

```sh
export ECR_BACKEND_FLASK_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/backend-flask"
echo $ECR_BACKEND_FLASK_URL
```

build the backend-flask image *inside the directory

```sh
docker build -t backend-flask .
```

tag it

```sh
docker tag backend-flask:latest $ECR_BACKEND_FLASK_URL:latest
```

and push to our repo

```sh
docker push $ECR_BACKEND_FLASK_URL:latest
```

8) Create a container, first create policies for the container, and then pass the parameters to the ssm

```sh
export OTEL_EXPORTER_OTLP_HEADERS="x-honeycomb-team=$HONEYCOMB_API_KEY"
aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/AWS_ACCESS_KEY_ID" --value $AWS_ACCESS_KEY_ID
aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/AWS_SECRET_ACCESS_KEY" --value $AWS_SECRET_ACCESS_KEY
aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/CONNECTION_URL" --value $PROD_CONNECTION_URL
aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/ROLLBAR_ACCESS_TOKEN" --value $ROLLBAR_ACCESS_TOKEN
aws ssm put-parameter --type "SecureString" --name "/cruddur/backend-flask/OTEL_EXPORTER_OTLP_HEADERS" --value "x-honeycomb-team=$HONEYCOMB_API_KEY"
```

(i) Create the new trust entities json file under this path aws/policies/service-assume-role-execution-policy.json

```sh
{
  "Version":"2012-10-17",
  "Statement":[{
      "Action":["sts:AssumeRole"],
      "Effect":"Allow",
      "Principal":{
        "Service":["ecs-tasks.amazonaws.com"]
    }}]
}

```

Create another json file under this path aws/policies/service-execution-policy.json

```sh
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "*"
        },
        {
            "Sid": "VisualEditor1",
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameters",
                "ssm:GetParameter"
            ],
            "Resource": "arn:aws:ssm:eu-west-2:238967891447:parameter/cruddur/backend-flask/*"
        }
    ]
}
```

run the following two commands on CLI terminal, attaching to the CruddurServiceExecutionRole the CloudWatchFullAccess

```sh
aws iam create-role \
    --role-name CruddurServiceExecutionRole \
    --assume-role-policy-document file://aws/policies/service-assume-role-execution-policy.json
```


```
aws iam put-role-policy \
    --policy-name CruddurServiceExecutionPolicy \
    --role-name CruddurServiceExecutionRole  \
    --policy-document file://aws/policies/service-execution-policy.json
```

(ii) Create the taskrole

```sh
aws iam create-role \
    --role-name CruddurTaskRole \
    --assume-role-policy-document "{
  \"Version\":\"2012-10-17\",
  \"Statement\":[{
    \"Action\":[\"sts:AssumeRole\"],
    \"Effect\":\"Allow\",
    \"Principal\":{
      \"Service\":[\"ecs-tasks.amazonaws.com\"]
    }
  }]
}"
```

attach this policy for SSM

```sh
aws iam put-role-policy \
  --policy-name SSMAccessPolicy \
  --role-name CruddurTaskRole \
  --policy-document "{
  \"Version\":\"2012-10-17\",
  \"Statement\":[{
    \"Action\":[
      \"ssmmessages:CreateControlChannel\",
      \"ssmmessages:CreateDataChannel\",
      \"ssmmessages:OpenControlChannel\",
      \"ssmmessages:OpenDataChannel\"
    ],
    \"Effect\":\"Allow\",
    \"Resource\":\"*\"
  }]
}
```

run this command to give access to cloudwatch cruddurtaskrole

```sh
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/CloudWatchFullAccess --role-name CruddurTaskRole
```
run this command to attach a policy to write to the xraydaemon

```sh
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess --role-name CruddurTaskRole
```

9) Create the task definition via cli by creating a new file /aws/task-definitions/backend-flask.json

```sh
{
  "family": "backend-flask",
  "executionRoleArn": "arn:aws:iam::xxxxx:role/CruddurServiceExecutionRole",
  "taskRoleArn": "",
  "networkMode": "awsvpc",
  "cpu": "000",
  "memory": "000",
  "requiresCompatibilities": [ 
    "FARGATE" 
  ],
  "containerDefinitions": [
    {
      "name": "backend-flask",
      "image": "xxxxx.dkr.ecr.us-east-1.amazonaws.com/backend-flask",
      "essential": true,
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "python /backend-flask/bin/flask/health-check"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      },
      "portMappings": [
        {
          "name": "backend-flask",
          "containerPort": 4567,
          "protocol": "tcp", 
          "appProtocol": "http"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
            "awslogs-group": "cruddur",
            "awslogs-region": "us-east-1",
            "awslogs-stream-prefix": "backend-flask"
        }
      },
      "environment": [
        {"name": "OTEL_SERVICE_NAME", "value": "backend-flask"},
        {"name": "OTEL_EXPORTER_OTLP_ENDPOINT", "value": "https://api.honeycomb.io"},
        {"name": "AWS_COGNITO_USER_POOL_ID", "value": "us-east-1_xxxxx"},
        {"name": "AWS_COGNITO_USER_POOL_CLIENT_ID", "value": "xxxxxxxx"},
        {"name": "FRONTEND_URL", "value": "*"},
        {"name": "BACKEND_URL", "value": "*"},
        {"name": "AWS_DEFAULT_REGION", "value": "us-east-1"}
      ],
      "secrets": [
        {"name": "AWS_ACCESS_KEY_ID"    , "valueFrom": "arn:aws:ssm:us-east-1:xxxx:parameter/cruddur/backend-flask/AWS_ACCESS_KEY_ID"},
        {"name": "AWS_SECRET_ACCESS_KEY", "valueFrom": "arn:aws:ssm:us-east-1:xxxx:parameter/cruddur/backend-flask/AWS_SECRET_ACCESS_KEY"},
        {"name": "CONNECTION_URL"       , "valueFrom": "arn:aws:ssm:us-east-1:xxxx:parameter/cruddur/backend-flask/CONNECTION_URL" },
        {"name": "ROLLBAR_ACCESS_TOKEN" , "valueFrom": "arn:aws:ssm:us-east-1:xxxx:parameter/cruddur/backend-flask/ROLLBAR_ACCESS_TOKEN" },
        {"name": "OTEL_EXPORTER_OTLP_HEADERS" , "valueFrom": "arn:aws:ssm:us-east-1:xxxxxx:parameter/cruddur/backend-flask/OTEL_EXPORTER_OTLP_HEADERS" }
      ]
    }
  ]
}
```

launch the task definition by executing this command

```sh
aws ecs register-task-definition --cli-input-json file://aws/task-definitions/backend-flask.json
```

the next step is to find the default vpc run this command

```sh
export DEFAULT_VPC_ID=$(aws ec2 describe-vpcs \
--filters "Name=isDefault, Values=true" \
--query "Vpcs[0].VpcId" \
--output text)
echo $DEFAULT_VPC_ID
```

run this to create the security group

```sh
export CRUD_SERVICE_SG=$(aws ec2 create-security-group \
  --group-name "crud-srv-sg" \
  --description "Security group for Cruddur services on ECS" \
  --vpc-id $DEFAULT_VPC_ID \
  --query "GroupId" --output text)
echo $CRUD_SERVICE_SG
```

```sh
aws ec2 authorize-security-group-ingress \
  --group-id $CRUD_SERVICE_SG \
  --protocol tcp \
  --port 4567 \
  --cidr 0.0.0.0/0
  ```

10) Create a service-backend-flask.json file, replace the value of security group and subnetmask

```sh
{
  "cluster": "cruddur",
  "launchType": "FARGATE",
  "desiredCount": 1,
  "enableECSManagedTags": true,
  "enableExecuteCommand": true,
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "assignPublicIp": "ENABLED",
      "securityGroups": [
        "TO CHANGE"
      ],
      "subnets": [
        "TO CHANGE",
        "TO CHANGE",
        "TO CHANGE"
      ]
    }
  },
  "propagateTags": "SERVICE",
  "serviceName": "backend-flask",
  "taskDefinition": "backend-flask",
  "serviceConnectConfiguration": {
    "enabled": true,
    "namespace": "cruddur",
    "services": [
      {
        "portName": "backend-flask",
        "discoveryName": "backend-flask",
        "clientAliases": [{"port": 4567}]
      }
    ]
  }
}
```

You can run the following code in the terminal to get the default subnet

```sh
export DEFAULT_SUBNET_IDS=$(aws ec2 describe-subnets  \
 --filters Name=vpc-id,Values=$DEFAULT_VPC_ID \
 --query 'Subnets[*].SubnetId' \
 --output json | jq -r 'join(",")')
echo $DEFAULT_SUBNET_IDS
```

run the following command to create a service in the  backend flask

```sh
aws ecs create-service --cli-input-json file://aws/json/service-backend-flask.json

```


11) Connect to the containers using the session manager tool for ubuntu

install the session manager. here is the [reference](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html#install-plugin-linux)

```sh
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb"


sudo dpkg -i session-manager-plugin.deb

session-manager-plugin

```

connect in the container with this command

```sh
aws ecs execute-command  \
    --region $AWS_DEFAULT_REGION \
    --cluster cruddur \
    --task TOCHANGED \
    --container backend-flask \
    --command "/bin/bash" \
    --interactive
  ```

add theses codes in the gitpod.yml file

```sh
name: fargate
    before: |
      curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb"
      sudo dpkg -i session-manager-plugin.deb
      cd backend-flask

```

create a ssm folder and a connect-to-service. Always remember to chmod u+x your files

```sh
#! /usr/bin/bash

if [ -z "$1" ]; then
    echo "No TASK_ID argument supplied eg ./bin/ecs/connect-to service xxxxxxxxxxxxxxxxxxxxx backend-flask"
    exit 1
fi
TASK_ID=$1

if [ -z "$2" ]; then
    echo "No CONTAINER_NAME argument supplied eg ./bin/ecs/connect-to service xxxxxxxxxxxxxxxxxxx backend-flask"
    exit 2
fi
CONTAINER_NAME=$2


aws ecs execute-command  \
    --region $AWS_DEFAULT_REGION \
    --cluster cruddur \
    --task $TASK_ID \
    --container $CONTAINER_NAME \
    --command "/bin/bash" \
    --interactive
```


12) Create load balancer and set in the backend container, adding the following code in service-backend-flask.json file

```sh
"loadBalancers": [
      {
          "targetGroupArn": "",
          "containerName": "",
          "containerPort": 0
      }
    ],
```
Then, on the targetGroupArn insert the arn of the target group, the target-group for the backend-flask
on container name backend-flask and port:4567.

13) Create the task definition for the frontend-react-js.first

```sh
"family": "frontend-react-js",
    "executionRoleArn": "arn:aws:iam::xxxxxxx:role/CruddurServiceExecutionRole",
    "taskRoleArn": "arn:aws:iam::xxxxxxx:role/CruddurTaskRole",
    "networkMode": "awsvpc",
    "cpu": "256",
    "memory": "512",
    "requiresCompatibilities": [ 
      "FARGATE" 
    ],
    "containerDefinitions": [
      {
        "name": "frontend-react-js",
        "image": "number.dkr.ecr.REGION.amazonaws.com/frontend-react-js",
        "essential": true,
        "portMappings": [
          {
            "name": "frontend-react-js",
            "containerPort": 3000,
            "protocol": "tcp", 
            "appProtocol": "http"
          }
        ],
  
        "logConfiguration": {
          "logDriver": "awslogs",
          "options": {
              "awslogs-group": "cruddur",
              "awslogs-region": "us-east-1",
              "awslogs-stream-prefix": "frontend-react-js"
          }
        }
      }
    ]
  }
```


(i) Create a dockerfile.prod under the frontend-react-js

``` sh
# Base Image ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
FROM node:16.18 AS build

ARG REACT_APP_BACKEND_URL
ARG REACT_APP_AWS_PROJECT_REGION
ARG REACT_APP_AWS_COGNITO_REGION
ARG REACT_APP_AWS_USER_POOLS_ID
ARG REACT_APP_CLIENT_ID

ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_AWS_PROJECT_REGION=$REACT_APP_AWS_PROJECT_REGION
ENV REACT_APP_AWS_COGNITO_REGION=$REACT_APP_AWS_COGNITO_REGION
ENV REACT_APP_AWS_USER_POOLS_ID=$REACT_APP_AWS_USER_POOLS_ID
ENV REACT_APP_CLIENT_ID=$REACT_APP_CLIENT_ID

COPY . ./frontend-react-js
WORKDIR /frontend-react-js
RUN npm install
RUN npm run build

# New Base Image ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
FROM nginx:1.23.3-alpine

# --from build is coming from the Base Image
COPY --from=build /frontend-react-js/build /usr/share/nginx/html
COPY --from=build /frontend-react-js/nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000
```

(ii) Create a file called nginx.conf under the frontend-react-js

```sh
# Set the worker processes
worker_processes 1;

# Set the events module
events {
  worker_connections 1024;
}

# Set the http module
http {
  # Set the MIME types
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  # Set the log format
  log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

  # Set the access log
  access_log  /var/log/nginx/access.log main;

  # Set the error log
  error_log /var/log/nginx/error.log;

  # Set the server section
  server {
    # Set the listen port
    listen 3000;

    # Set the root directory for the app
    root /usr/share/nginx/html;

    # Set the default file to serve
    index index.html;

    location / {
        # First attempt to serve request as file, then
        # as directory, then fall back to redirecting to index.html
        try_files $uri $uri/ $uri.html /index.html;
    }

    # Set the error page
    error_page  404 /404.html;
    location = /404.html {
      internal;
    }

    # Set the error page for 500 errors
    error_page  500 502 503 504  /50x.html;
    location = /50x.html {
      internal;
    }
  }
}

```

from the folder frontend-react-js run this command to build

```sh
npm run build
```

(iii) Create a folder frontend and file run to execute the following command to point to the url of the load balancer
 
```sh
docker build \
--build-arg REACT_APP_BACKEND_URL="http://cruddur-alb-00000.us-east-1.elb.amazonaws.com:4567" \
--build-arg REACT_APP_AWS_PROJECT_REGION="$AWS_DEFAULT_REGION" \
--build-arg REACT_APP_AWS_COGNITO_REGION="$AWS_DEFAULT_REGION" \
--build-arg REACT_APP_AWS_USER_POOLS_ID="$AWS_USER_POOLS_ID" \
--build-arg REACT_APP_CLIENT_ID="$APP_CLIENT_ID" \
-t frontend-react-js \
-f Dockerfile.prod \
.

```


(iv) create the repo for the frontend ECR

```sh
aws ecr create-repository \
  --repository-name frontend-react-js \
  --image-tag-mutability MUTABLE
```


set the env var

```sh
export ECR_FRONTEND_REACT_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/frontend-react-js"
echo $ECR_FRONTEND_REACT_URL
```

tag the image

```sh
docker tag frontend-react-js:latest $ECR_FRONTEND_REACT_URL:latest
```

and push to the repo in ecr

```sh
docker push $ECR_FRONTEND_REACT_URL:latest
```

(v) create the the task definition file for the frontend-react-js

```sh
{
    "family": "frontend-react-js",
    "executionRoleArn": "arn:aws:iam::000000:role/CruddurServiceExecutionRole",
    "taskRoleArn": "arn:aws:iam::000000:role/CruddurTaskRole",
    "networkMode": "awsvpc",
    "cpu": "256",
    "memory": "512",
    "requiresCompatibilities": [ 
      "FARGATE" 
    ],
    "containerDefinitions": [
      {
        "name": "frontend-react-js",
        "image": "000000.dkr.ecr.us-east-1.amazonaws.com/frontend-react-jss",
        "essential": true,
        "portMappings": [
          {
            "name": "frontend-react-js",
            "containerPort": 3000,
            "protocol": "tcp", 
            "appProtocol": "http"
          }
        ],
  
        "logConfiguration": {
          "logDriver": "awslogs",
          "options": {
              "awslogs-group": "cruddur",
              "awslogs-region": "us-east-1",
              "awslogs-stream-prefix": "frontend-react-js"
          }
        }
      }
    ]
  }
```

and the service-front-react-js.json file

```sh
{
    "cluster": "cruddur",
    "launchType": "FARGATE",
    "desiredCount": 1,
    "enableECSManagedTags": true,
    "enableExecuteCommand": true,
    "loadBalancers": [
      {
          "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-1:xxxxx:targetgroup/cruddur-frontend-react-js/000g00",
          "containerName": "frontend-react-js",
          "containerPort": 3000
      }
    ],
    "networkConfiguration": {
      "awsvpcConfiguration": {
        "assignPublicIp": "ENABLED",
        "securityGroups": [
            "sg-group"
          ],
          "subnets": [
            "subnet1",
            "subnet2",
            "subnet3",
            "subnet4",
            "subnet5",
            "subnet6"
          ]
      }
    },
    "propagateTags": "SERVICE",
    "serviceName": "frontend-react-js",
    "taskDefinition": "frontend-react-js",
    "serviceConnectConfiguration": {
      "enabled": true,
      "namespace": "cruddur",
      "services": [
        {
          "portName": "frontend-react-js",
          "discoveryName": "frontend-react-js",
          "clientAliases": [{"port": 3000}]
        }
      ]
    }
  }
```

create the services for the frontend-react-js using the following command

```sh
aws ecs create-service --cli-input-json file://aws/json/service-frontend-react-js.json

```

create the task definition for the frontend-react-js with this command too

```sh
aws ecs register-task-definition --cli-input-json file://aws/task-definitions/frontend-react-js.json

```

also insert this code for the frontend-react-js-json in the task-definitions

```sh
"healthCheck": {
          "command": [
            "CMD-SHELL",
            "curl -f http://localhost:3000 || exit 1"
          ],
          "interval": 30,
          "timeout": 5,
          "retries": 3
        },
```

I had a problem with creating my service  and figured the problem was the  ALB and the target group wasn't set, I enable the security group for the port 3000.


## Implementation of the SSL and configuration of Domain from Route53

1) I firstly bought a domain name from [porkbun website](https://porkbun.com/) then, I Created the hosted zone for [my domain](http://nwaliechinyere.xyz/) It won't work now and will show 404 error this is because my container isn't on. Most importantly, I took note of the "name servers" it should look like this

```sh
ns-00.awsdns-00.com.
ns-0000.awsdns-00.org.
ns-0000.awsdns-00.com.
ns-000.awsdns-00.net.
```

-NB: In the Route53 under domains, go to registered domain, in the name servers, check if it's the same of the values in "name servers" if not, please ensure to change it all at first mine din't work till i changed it.

2) Create a SSL/TLS certificate: go to AWS Certificate Manager click -> Request a public certificate <- and under -> Fully qualified domain name <- insert your domain. 
 
select and click on -> DNS validation - recommended <- and select RSA 2048, Once  the request is created, go to the certificate request and click on create records in route 53. If no reponse, click on it again.

NB: It took me more than a day to get this, but that was because i didn't observe my name servers, it took others about a few min to have the status changed from "pending validation" to "issued".

Once the certification is issued, proceed to  modify Route53 ALB, Task definition and Always remember when you've made modifications, re-build, push and tag the images in both the backend and frontend services.

3) In the task definition of the backend, change the following codes:
```sh
   {"name": "FRONTEND_URL", "value": "https://nwaliechinyere.xyz"},
   {"name": "BACKEND_URL", "value": "https://api.nwaliechinyere.xyz"},
```

Recreate the task definition, re-build, tag and push the image of the frontend with this codes. 

```sh
docker build \
--build-arg REACT_APP_BACKEND_URL="https://nwaliechinyere.xyz" \
--build-arg REACT_APP_AWS_PROJECT_REGION="$AWS_DEFAULT_REGION" \
--build-arg REACT_APP_AWS_COGNITO_REGION="$AWS_DEFAULT_REGION" \
--build-arg REACT_APP_AWS_USER_POOLS_ID="$AWS_USER_POOLS_ID" \
--build-arg REACT_APP_CLIENT_ID="$APP_CLIENT_ID" \
-t frontend-react-js \
-f Dockerfile.prod \
.
```

Note: Ensure to open the Security groups of the container backend flask from the SG of the RDS for the port 5432 else you would not be able to use the test script to check the RDS from the container backendflask in ECS.

## Securing Backend flask

1) In this part Andrew Brown created Two Docker files: One was Dockerfile.prod in the backend with these codes

```sh
FROM xxxxxxxxxxxxx.dkr.ecr.us-east-1.amazonaws.com/cruddur-python:3.10-slim-buster

WORKDIR /backend-flask

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .



EXPOSE ${PORT}
CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=4567", "--debug"]
```

The second was backend-flask.prod

```sh
FROM xxxxxxxx.dkr.ecr.us-east-1.amazonaws.com/cruddur-python:3.10-slim-buster

WORKDIR /backend-flask

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .


EXPOSE ${PORT}

CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=4567", "--no-debug", "--no-debugger", "--no-reload"]

```
NB: Make sure to test the docker production changes before pushing the image to the ECR repo.

2) Below are the scripts for the building for the backend.

```sh
#! /usr/bin/bash

ABS_PATH=$(readlink -f "$0")
BUILD_PATH=$(dirname $ABS_PATH)
DOCKER_PATH=$(dirname $BUILD_PATH)
BIN_PATH=$(dirname $DOCKER_PATH)
PROJECT_PATH=$(dirname $BIN_PATH)
BACKEND_FLASK_PATH="$PROJECT_PATH/backend-flask"

docker build \
-f "$BACKEND_FLASK_PATH/Dockerfile.prod" \
-t backend-flask-prod \
"$BACKEND_FLASK_PATH/."
```
Note that the REACT_APP_BACKEND_URL should point to your domain.

```sh
#! /usr/bin/bash

docker build \
--build-arg REACT_APP_BACKEND_URL="https:nwaliechinyere.xyz" \
--build-arg REACT_APP_AWS_PROJECT_REGION="$AWS_DEFAULT_REGION" \
--build-arg REACT_APP_AWS_COGNITO_REGION="$AWS_DEFAULT_REGION" \
--build-arg REACT_APP_AWS_USER_POOLS_ID="$AWS_USER_POOLS_ID" \
--build-arg REACT_APP_CLIENT_ID="$APP_CLIENT_ID" \
-t frontend-react-js \
-f Dockerfile.prod \
.
```

run this script to build the image for the backend-flask.prod

```sh
#! /usr/bin/bash

docker run --rm \
-p 4567:4567 \
--env AWS_ENDPOINT_URL="http://dynamodb-local:8000" \
--env CONNECTION_URL="postgresql://postgres:password@db:5432/cruddur" \
--env FRONTEND_URL="https://3000-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}" \
--env BACKEND_URL="https://4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}" \
--env OTEL_SERVICE_NAME='backend-flask' \
--env OTEL_EXPORTER_OTLP_ENDPOINT="https://api.honeycomb.io" \
--env OTEL_EXPORTER_OTLP_HEADERS="x-honeycomb-team=${HONEYCOMB_API_KEY}" \
--env AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION}" \
--env AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}" \
--env AWS_XRAY_URL="*4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}*" \
--env AWS_XRAY_DAEMON_ADDRESS="xray-daemon:2000" \
--env AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}" \
--env ROLLBAR_ACCESS_TOKEN="${ROLLBAR_ACCESS_TOKEN}" \
--env AWS_COGNITO_USER_POOL_ID="${AWS_USER_POOLS_ID}" \
--env AWS_COGNITO_USER_POOL_CLIENT_ID="${APP_CLIENT_ID}" \
-it backend-flask-prod
```


3) Create a script to push the image to ecr

```sh
#! /usr/bin/bash


ECR_BACKEND_FLASK_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/backend-flask"
echo $ECR_BACKEND_FLASK_URL

docker tag backend-flask-prod:latest $ECR_BACKEND_FLASK_URL:latest
docker push $ECR_BACKEND_FLASK_URL:latest

```

do same for the frontend-react-js

```sh
#! /usr/bin/bash


ECR_FRONTEND_REACT_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/frontend-react-js"
echo $ECR_FRONTEND_REACT_URL

docker tag frontend-react-js-prod:latest $ECR_FRONTEND_REACT_URL:latest
docker push $ECR_FRONTEND_REACT_URL:latest
```

4) Create a file in bin folder that eases the deployment process of the ecs backend-flask.

```sh
#! /usr/bin/bash

CLUSTER_NAME="cruddur"
SERVICE_NAME="backend-flask"
TASK_DEFINTION_FAMILY="backend-flask"


LATEST_TASK_DEFINITION_ARN=$(aws ecs describe-task-definition \
--task-definition $TASK_DEFINTION_FAMILY \
--query 'taskDefinition.taskDefinitionArn' \
--output text)

echo "TASK DEF ARN:"
echo $LATEST_TASK_DEFINITION_ARN

aws ecs update-service \
--cluster $CLUSTER_NAME \
--service $SERVICE_NAME \
--task-definition $LATEST_TASK_DEFINITION_ARN \
--force-new-deployment

#aws ecs describe-services \
#--cluster $CLUSTER_NAME \
#--service $SERVICE_NAME \
#--query 'services[0].deployments' \
#--output table
```

NB: We moved the location of the ./backend-flask/bin and created another bin folder moving these folders and files to it;  
/db/schema-load
/db/seed
/db/setup
/db/connect
/db/test
/ddb/schema-load
/ddb/seed
/cognito files
/build/backend-flask
/build/frontend-react-js

And we also created a folder for Backend and Frontend in the bin folder and made build, tag, push scripts in it. we didn't move the ./flask/health-check and for any changes made in the backend or frontend, do the build-tag-push and force the deployment.

## Fixing Check Auth Cognito

1) This is because at the moment the token won't update so, replace the checkAuth.js with the following code:

```sh
import { Auth } from 'aws-amplify';
import { resolvePath } from 'react-router-dom';

export async function getAccessToken(){
  Auth.currentSession()
  .then((cognito_user_session) => {
    const access_token = cognito_user_session.accessToken.jwtToken
    localStorage.setItem("access_token", access_token)
  })
  .catch((err) => console.log(err));
}

export async function checkAuth(setUser){
  Auth.currentAuthenticatedUser({
    // Optional, By default is false. 
    // If set to true, this call will send a 
    // request to Cognito to get the latest user data
    bypassCache: false 
  })
  .then((cognito_user) => {
    setUser({
      cognito_user_uuid: cognito_user.attributes.sub,
      display_name: cognito_user.attributes.name,
      handle: cognito_user.attributes.preferred_username
    })
    return Auth.currentSession()
  }).then((cognito_user_session) => {
      localStorage.setItem("access_token", cognito_user_session.accessToken.jwtToken)
  })
  .catch((err) => console.log(err));
};
```

2) Replace and add the following code in the first line for the following files:

Frontend-react-js/src/components/MessageForm.js
Frontend-react-js/src/pages/HomeFeedPage.js
Frontend-react-js/src/pages/MessageGroupNewPage.js
Frontend-react-js/src/pages/MessageGroupPage.js
Frontend-react-js/src/components/MessageForm.js

```sh
import {checkAuth, getAccessToken} from '../lib/CheckAuth';

import {getAccessToken} from '../lib/CheckAuth';
```


```
  await getAccessToken()
  const access_token = localStorage.getItem("access_token")
```


```
Authorization': `Bearer ${access_token}`
```
-NB: Please make sure to change these codes because this was where I hit multiple errors that made my code blank till I joined the office hours and andrew helped debugged

--image--

## Implementation of Xray on Ecs and Container Insights

1) add the following part for the xray task definition backend and frontend

```sh
{
      "name": "xray",
      "image": "public.ecr.aws/xray/aws-xray-daemon" ,
      "essential": true,
      "user": "1337",
      "portMappings": [
        {
          "name": "xray",
          "containerPort": 2000,
          "protocol": "udp"
        }
      ]
    },
```

create the script to create the new task definition
on the folder aws-bootcamp-cruddur-2023/bin/backend create a file called register.
```sh
#! /usr/bin/bash

ABS_PATH=$(readlink -f "$0")
FRONTEND_PATH=$(dirname $ABS_PATH)
BIN_PATH=$(dirname $FRONTEND_PATH)
PROJECT_PATH=$(dirname $BIN_PATH)
TASK_DEF_PATH="$PROJECT_PATH/aws/task-definitions/backend-flask.json"

echo $TASK_DEF_PATH

aws ecs register-task-definition \
--cli-input-json "file://$TASK_DEF_PATH"
```

do the same thing for the frontend
on the folder aws-bootcamp-cruddur-2023/bin/frontend create a file called register.

```sh
#! /usr/bin/bash

ABS_PATH=$(readlink -f "$0")
BACKEND_PATH=$(dirname $ABS_PATH)
BIN_PATH=$(dirname $BACKEND_PATH)
PROJECT_PATH=$(dirname $BIN_PATH)
TASK_DEF_PATH="$PROJECT_PATH/aws/task-definitions/frontend-react-js.json"

echo $TASK_DEF_PATH

aws ecs register-task-definition \
--cli-input-json "file://$TASK_DEF_PATH"
```

on the folder aws-bootcamp-cruddur-2023/bin/backend create a file called run.
```sh
#! /usr/bin/bash

ABS_PATH=$(readlink -f "$0")
BACKEND_PATH=$(dirname $ABS_PATH)
BIN_PATH=$(dirname $BACKEND_PATH)
PROJECT_PATH=$(dirname $BIN_PATH)
ENVFILE_PATH="$PROJECT_PATH/backend-flask.env"

docker run --rm \
--env-file $ENVFILE_PATH \
--network cruddur-net \
--publish 4567:4567 \
-it backend-flask-prod

```
NOTE:
add the  /bin/bash after the -it backend-flask-prod if you want to shell inside the contianer.

on the folder aws-bootcamp-cruddur-2023/bin/frontend create a file called run.
```sh
#! /usr/bin/bash

ABS_PATH=$(readlink -f "$0")
FRONTEND_PATH=$(dirname $ABS_PATH)
BIN_PATH=$(dirname $FRONTEND_PATH)
PROJECT_PATH=$(dirname $BIN_PATH)
ENVFILE_PATH="$PROJECT_PATH/frontend-react-js.env"

docker run --rm \
--env-file $ENVFILE_PATH \
--network cruddur-net \
--publish 3000:3000 \
-it frontend-react-js-prod

```

change the code of the docker-compose-gitpod.yml of the backend

```
environment:
      AWS_ENDPOINT_URL: "http://dynamodb-local:8000"
      #CONNECTION_URL: "${PROD_CONNECTION_URL}"
      CONNECTION_URL: "postgresql://postgres:password@db:5432/cruddur"
      #FRONTEND_URL: "https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
      #BACKEND_URL: "https://${CODESPACE_NAME}-4567.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
      FRONTEND_URL: "https://3000-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}"
      BACKEND_URL: "https://4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}"
      OTEL_SERVICE_NAME: 'backend-flask'
      OTEL_EXPORTER_OTLP_ENDPOINT: "https://api.honeycomb.io"
      OTEL_EXPORTER_OTLP_HEADERS: "x-honeycomb-team=${HONEYCOMB_API_KEY}"
      AWS_DEFAULT_REGION: "${AWS_DEFAULT_REGION}"
      AWS_ACCESS_KEY_ID: "${AWS_ACCESS_KEY_ID}"
      AWS_XRAY_URL: "*4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}*"
      #AWS_XRAY_URL: "*${CODESPACE_NAME}-4567.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}*"
      AWS_XRAY_DAEMON_ADDRESS: "xray-daemon:2000"
      AWS_SECRET_ACCESS_KEY: "${AWS_SECRET_ACCESS_KEY}"
      ROLLBAR_ACCESS_TOKEN: "${ROLLBAR_ACCESS_TOKEN}"
      #env var for jwttoken
      AWS_COGNITO_USER_POOL_ID: "${AWS_USER_POOLS_ID}"
      AWS_COGNITO_USER_POOL_CLIENT_ID: "${APP_CLIENT_ID}"
```

with the following code
```
  env_file:
      - backend-flask.env
```

same thing for the frontend

```sh
environment:
      REACT_APP_BACKEND_URL: "https://4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}"
      #REACT_APP_BACKEND_URL: "https://${CODESPACE_NAME}-4567.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
      REACT_APP_AWS_PROJECT_REGION: "${AWS_DEFAULT_REGION}"
      #REACT_APP_AWS_COGNITO_IDENTITY_POOL_ID: ""
      REACT_APP_AWS_COGNITO_REGION: "${AWS_DEFAULT_REGION}"
      REACT_APP_AWS_USER_POOLS_ID: "${AWS_USER_POOLS_ID}"
      REACT_APP_CLIENT_ID: "${APP_CLIENT_ID}"
```

with the following code

```sh
  env_file:
      - frontend-react-js.env
```

Since the file env does not pass the value of the env var, there is additional implementation that needs to be done.

create a file generate-env-gitpod under the aws-bootcamp-cruddur-2023/bin/backend

and paste the following code
```
#! /usr/bin/env ruby

require 'erb'

template = File.read 'erb/backend-flask-gitpod.env.erb'
content = ERB.new(template).result(binding)
filename = "backend-flask.env"
File.write(filename, content)

```


create a file generate-env-gitpod under the aws-bootcamp-cruddur-2023/bin/frontend

and paste the following code
```
#! /usr/bin/env ruby

require 'erb'

template = File.read 'erb/frontend-react-js-gitpod.env.erb'
content = ERB.new(template).result(binding)
filename = "frontend-react-js.env"
File.write(filename, content)

```

create  a folder called erb and create the following file backend-flask-gitpod.env.erb under erb folder


```sh
AWS_ENDPOINT_URL=http://dynamodb-local:8000
CONNECTION_URL=postgresql://postgres:password@db:5432/cruddur
FRONTEND_URL=https://3000-<%= ENV['GITPOD_WORKSPACE_ID'] %>.<%= ENV['GITPOD_WORKSPACE_CLUSTER_HOST'] %>
BACKEND_URL=https://4567-<%= ENV['GITPOD_WORKSPACE_ID'] %>.<%= ENV['GITPOD_WORKSPACE_CLUSTER_HOST'] %>
OTEL_SERVICE_NAME=backend-flask
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io
OTEL_EXPORTER_OTLP_HEADERS=x-honeycomb-team=<%= ENV['HONEYCOMB_API_KEY'] %>
AWS_XRAY_URL=*4567-<%= ENV['GITPOD_WORKSPACE_ID'] %>.<%= ENV['GITPOD_WORKSPACE_CLUSTER_HOST'] %>*
AWS_XRAY_DAEMON_ADDRESS=xray-daemon:2000
AWS_DEFAULT_REGION=<%= ENV['AWS_DEFAULT_REGION'] %>
AWS_ACCESS_KEY_ID=<%= ENV['AWS_ACCESS_KEY_ID'] %>
AWS_SECRET_ACCESS_KEY=<%= ENV['AWS_SECRET_ACCESS_KEY'] %>
ROLLBAR_ACCESS_TOKEN=<%= ENV['ROLLBAR_ACCESS_TOKEN'] %>
AWS_COGNITO_USER_POOL_ID=<%= ENV['AWS_USER_POOLS_ID'] %>
AWS_COGNITO_USER_POOL_CLIENT_ID=<%= ENV['APP_CLIENT_ID'] %>

```

create  a folder called erb and create the following file frontend-react-js-gitpod.env.erb 

```sh
REACT_APP_BACKEND_URL=https://4567-<%= ENV['GITPOD_WORKSPACE_ID'] %>.<%= ENV['GITPOD_WORKSPACE_CLUSTER_HOST'] %>
REACT_APP_AWS_PROJECT_REGION=<%= ENV['AWS_DEFAULT_REGION'] %>
REACT_APP_AWS_COGNITO_REGION=<%= ENV['AWS_DEFAULT_REGION'] %>
REACT_APP_AWS_USER_POOLS_ID=<%= ENV['AWS_USER_POOLS_ID'] %>
REACT_APP_CLIENT_ID=<%= ENV['APP_CLIENT_ID'] %>
```

from the gitpod.yml add the scripts to create the files env necessary for the backend and frontend dockers.
```
  source  "$THEIA_WORKSPACE_ROOT/bin/backend/generate-env-gitpod"
  source  "$THEIA_WORKSPACE_ROOT/bin/frontend/generate-env-gitpod
```


In this part of the implementation, we link all the containers to connect with a specific network.
change the configuration of your docker-compose.yml
```
networks: 
  internal-network:
    driver: bridge
    name: cruddur
```
with the following code

```
networks: 
  cruddur-net:
    driver: bridge
    name: cruddur-net
```

and for each services, make sure to attach the crudduer-net network by adding the following code
```
  networks:
      - cruddur-net
```

to troublshoot, you can use a busy box.
create a file under aws-bootcamp-cruddur-2023/bin called busybox
and paste the following code
```
#! /usr/bin/bash

docker run --rm \
  --network cruddur-net \
  -p 4567:4567 \
  -it busybox
```

also we can add some tools such as ping on our dockerfile.prod
after url of the image. this is for the debugging

```
RUN apt-get update -y
RUN apt-get install iputils-ping -y
```
# Enable Container Insights

To enable this function, go to the cluster and click on update cluster.

Under the section Monitoring, toggle on Use Container Insights
