# Week 4 — Postgres and RDS

This week has to do with RDS, SQL, PSQL database and I was able to learn from my instructor all of these. 

- Things to note about Amazon RDS security best practices before I lead you on how i created mine; 

Use amazon virtual cloud (VPC) to create a private network for your RDS instance. This helps prevent unauthorized access to your instance from the public internet.

Compliance standard is what your business requires.

RDS instance should always be in the AWS region that you are legally allowed to be holding user data in.

Amazon organizations SCP is used to manage RDS deletion, RDS creation, region lock, RDS Encryption enforcement.

AWS CloudTrail is enabled to monitor trigger alerts on malicious RDS behaviour by an identity in AWS.

Amazon Guardduty is enabled in the account and region of RDS.

Also, Un-relational database is mysql, postgres and outbound rules state that without vpc, it can go anywhere. 

# Technical Task
I created an RDS datbase and named it cruddurroot and I connected to Postgres via CLI. 

![RDS](assets/RDS%20week%204.jpg)

Alongside I installed the Postgres container and wrote scripts in my `docker-compose.yml` file.

```sh
 db:
    image: postgres:13-alpine
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=<enteryourpassword>
    ports:
      - '5432:5432'
    volumes: 
      - db:/var/lib/postgresql/data

volumes:
  db:
    driver: local
```

- To connect to psql in my terminal I ran this command `psql -Upostgres --host localhost` 

Inserted my password , then I was connected to Postgres in my terminal.

Created cruddur locally ``CREATE database cruddur;``

I set environment variables in Gitpod for the Connection Url.

```sh
export CONNECTION_URL="postgresql://postgres:pssword@127.0.0.1:5433/cruddur"
gp env CONNECTION_URL="postgresql://postgres:pssword@127.0.0.1:5433/cruddur"
```

I created a database but firstly; In my backend, I created folders

``sh Bin folder and had db-create, db-connect, db-schema-load, db-seed, db-drop, db-setup,db-sessions, rds-update-sg-rule`` and ``db folder inserting schema.sql and seed sql files``

Wrote bash scripts to create tables, drop tables, insert data into tables. This was how i was able to create tables, insert data into the table, created connection in the environments Dev and Prod.

Bin is short form for binary, I asked the terminal where my bash is 
```sh
whereis bash`
```

- In order to create databases
```sh
echo "db-create"
```
We allow permission and changed owner by executing this  ``chmod u+x bin/db-create`` 

- `./bin/db-connect` To connect to the psql 
```sh
#! /usr/bin/bash
if [ "$1" = "prod" ]; then
  echo "Running in production mode"
  URL=$PROD_CONNECTION_URL
else
  URL=$CONNECTION_URL
fi

psql $URL
```

- `./bin/db-create` To create a new table 'cruddur'
```sh
#!  /usr/bin/bash

CYAN='\033[1;36m'
NO_COLOR='\033[0m'
LABEL="db-create"
printf "${CYAN}== ${LABEL}${NO_COLOR}\n"

NO_DB_CONNECTION_URL=$(sed 's/\/cruddur//g' <<< "$CONNECTION_URL")
psql $NO_DB_CONNECTION_URL -c "create database cruddur;"
```

- `./bin/db-drop` To drop an existing table.
```sh
#!  /usr/bin/bash

CYAN='\033[1;36m'
NO_COLOR='\033[0m'
LABEL="db-drop"
printf "${CYAN}== ${LABEL}${NO_COLOR}\n"

NO_DB_CONNECTION_URL=$(sed 's/\/cruddur//g' <<< "$CONNECTION_URL")
psql $NO_DB_CONNECTION_URL -c "drop database cruddur;"
```

- `./bin/db-schema-load` To load the schema. This means to give it contents and set its constraints.
```sh
#! /usr/bin/bash

CYAN='\033[1;36m'
NO_COLOR='\033[0m'
LABEL="db-schema-load"
printf "${CYAN}== ${LABEL}${NO_COLOR}\n"

schema_path="$(realpath .)/db/schema.sql"
echo $schema_path

if [ "$1" = "prod" ]; then
  echo "Running in production mode"
  URL=$PROD_CONNECTION_URL
else
  URL=$CONNECTION_URL
fi

psql $URL cruddur < $schema_path
```

- `./bin/db-seed` To insert the data into schema load.
```sh
#! /usr/bin/bash

CYAN='\033[1;36m'
NO_COLOR='\033[0m'
LABEL="db-seed"
printf "${CYAN}== ${LABEL}${NO_COLOR}\n"

seed_path="$(realpath .)/db/seed.sql"
echo $seed_path

if [ "$1" = "prod" ]; then
  echo "Running in production mode"
  URL=$PROD_CONNECTION_URL
else
  URL=$CONNECTION_URL
fi

psql $URL cruddur < $seed_path

```

And to connect to PROD environment, You add a prod at the back`./bin/db-connect prod`

# NB

When You login after you've stopped your machine, insert you password, create a database, connect all bin and db files. Eg ``./bin/db-setup`` From the list of it's hierachies.

When i created the Database instance in my Amazon RDS Service, Because of costs, I stopped it temprorarily and used it only when required. 

I took the end point of my instance for the connection URL; security group ID and security group rules. These were added in my `rds-update-sg-rules` shell script. 

I set the Inbound rules to connect to RDS by doing this I provided my Gitpod IP ``GITPOD_IP=$(curl ifconfig.me)`` and set inbound traffic on port 5432. This was what helped to get the IP for creating database, and inserting data. 

I got the security group rule ID so I can easily modify it in the future from the terminal here in Gitpod.

``sh

export DB_SG_ID="sg-0b725ebab7e25635e"
gp env DB_SG_ID="sg-0b725ebab7e25635e"
export DB_SG_RULE_ID="sgr-070061bba156cfa88"
gp env DB_SG_RULE_ID="sgr-070061bba156cfa88"
``

I also updated my URL from connection to production.

``sh

export PROD_CONNECTION_URL="postgresql://root:huEE33z2Qvl383@cruddur-db-instance.czz1cuvepklc.ca-central-1.rds.amazonaws.com:5432/cruddur"
gp env PROD_CONNECTION_URL="postgresql://root:huEE33z2Qvl383@cruddur-db-instance.czz1cuvepklc.ca-central-1.rds.amazonaws.com:5432/cruddur"

``

This is my database
![database](assets/database%20week%204.png)

# AWS Lambda

I setup Post Confirmation Lambda to get logs recorded as I sign in to the cruddur app, created the handler function, created lambda in same vpc as RDS instance Python 3.8.

- I added a layer for psycopg2 

``sh

arn:aws:lambda:ca-central-1:898466741470:layer:psycopg2-py38:1

``

I wrote scripts for Lambda for production

```sh
import json
import psycopg2

def lambda_handler(event, context):
    user = event['request']['userAttributes']
    try:
        conn = psycopg2.connect(
            host=(os.getenv('PG_HOSTNAME')),
            database=(os.getenv('PG_DATABASE')),
            user=(os.getenv('PG_USERNAME')),
            password=(os.getenv('PG_SECRET'))
        )
        cur = conn.cursor()
        cur.execute("INSERT INTO users (display_name, handle, cognito_user_id) VALUES(%s, %s, %s)", (user['name'], user['email'], user['sub']))
        conn.commit() 

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        
    finally:
        if conn is not None:
            cur.close()
            conn.close()
            print('Database connection closed.')

    return event
 ```
- I added the function to Cognito, under the user pool properties add the function as a ``Post Confirmation`` lambda trigger.

I had to do this Strenous process; deleting my user pool details in my cognito, then I signup in my cruddur app as a new user and below you can see the trigger.

![time out](assets/time%20out%20week4.png)

Cloud watch is essential to monitor activites, and below I am being informed what's happening.

![cloudwatch](assets/cloudwatch%20week%204.png)

At first I had a problem with this, but i rectified this issue by setting another inbound rule and set it as ``not PostgresSQL but ALL`` with my default security group since my gitpod IP will change with each new workspace and it’s only approved on port 5432 for the IP that I specify.

![inbound roles](assets/inbound%20rules.jpg)

Now It had been resolved and I am able to log into my cruddur app.

![resolved](assets/resolved%20week%204.png)

My backed-end logs kept notifying me I had an issue with my public activities.

![public activities](assets/public%20activities%20week%204.png)

I had Seriousss issue with this for weeks, but successfully I was able to rectify it by changing the last url line in both my db-seed script and db-schema-load from ``URL=$PRODUCTION_URL`` to ``URL=$PROD_CONNECTION_URL`` 

This is because I was always loading into my schema through my local database. because connection_url is the local connection url despite the name. But since I have changed it to production url, I ought to have updated my script which i late did.

Now I signed in a new user in my cognito and it dropped in my tables.

![cognito](assets/cognito.png)

I can signin my crudder app

![crudder](assets/cruddur%20week%204.png)
