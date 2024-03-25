# Week 4 — Postgres and RDS


 This week has to do with RDS, SQL, and PSQL for our database. Learning activities where centered on  relational databases RDS (Amazon Relational Database Service), SQL (Structured Query Language), and PSQL (PostgreSQL) and I was able to learn from my instructor all of these.

---

- [AWS Relational Database Service](#aws-relational-database-service)
  - [RDS Security Best Practices](#rds-security-best-practices)
  - [PostgreSQL](#postgresql)
  - [RDS Instance Creation in AWS Console and CLI](#rds-instance-creation-in-aws-console-and-CLI)
- [PSQL Commands](#psql-commands)
  - [Database for Cruddur](#database-for-cruddur)
  - [Connecting To PSQL in Gitpod for Local and Production](#connecting-to-psql-in-gitpod-for-local-and-production)
  - [Bash Scripts for Our Database Operations](#bash-scripts-for-our-database-operations)
- [Further Implementations for PostgreSQL](#further-implementations-for-postgresql)
  - [AWS Lambda](#aws-lambda)
  - [User Activities for Cruddur](#user-activities-for-cruddur)
- [Troubleshooting](#troubleshooting)

---


## AWS Relational Database Service

AWS RDS (Relational Database Service) is an AWS managed database service that makes it easy to set up, operate, and scale databases in the cloud, where it handles all the database tasks, such as backing up data, patching software, and managing storage. Tt also provides a variety of database engines to choose from, including MySQL, PostgreSQL, and Amazon Aurora and we'll integrate this database to facilitate CRUD operations, enabling us to store user posts seamlessly. 


A view of types of engines

![engines rds](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(727).png)


---

### RDS Security Best Practices

Things to note about Amazon RDS security best practices before I lead you on how I created my task 

1. Use Amazon virtual cloud (VPC) to create a private network for your RDS instance. This helps prevent unauthorized access to your instance from the public internet.
2. Compliance standard is what your business requires.
3. RDS instance should always be in the AWS region that you are legally allowed to be holding user data in.
4. Amazon organizations SCP is used to manage RDS deletion, RDS creation, region lock, RDS Encryption enforcement.
5. AWS CloudTrail is enabled to monitor trigger alerts on malicious RDS behaviour by an identity in AWS.
6. Amazon Guardduty is enabled in the account and region of RDS.
7. Also, Un-relational database is mysql, postgres and outbound rules state that without vpc, it can go anywhere. 

---

### PostgreSQL

PSQL also known as PostgreSQL is an object relational database management system  developed at the University of California at Berkeley Computer Science Department and also an open source descendant of this original Berkeley code that supports a large part of the SQL standard. It's known for its vast features, which includs; complex queries, foreign keys, triggers, updatable views, transactional integrity, multiversion concurrency control. Also, PostgreSQL can be extended by the user in many ways, for example by adding new; data types, functions, operators, aggregate functions, index methods, procedural languages.
And because of the liberal license, PostgreSQL can be used, modified, and distributed by anyone free of charge for any purpose, be it private, commercial, or academic.


  > POSTGRES pioneered many concepts that only became available in some commercial database systems much later.

**PSQL Features**

* Open source and free: It is freely available to use, modify, and distribute.
* ACID compliance: PostgreSQL guarantees that all transactions are atomic, consistent, isolated, and durable.
* JSON and XML support: The engine supports the JSON and XML data types, which makes it a good choice for applications that need to store and query semi-structured data.
* Full-text search: PostgreSQL has built-in full-text search capabilities, which makes it easy to find data within large datasets.
* Replication and clustering: PostgreSQL supports replication and clustering, which makes it possible to scale the database to meet the needs of growing applications.

*Our initial steps will involve creating the database, creating a connection to it, and then adding a schema file that works with the specifications*

---

### RDS Instance Creation in AWS Console and CLI

Make sure you're logged in to your AWS console;

1. Go to the RDS section in the AWS Management Console.
2. Click the `"Create database"` button.
3. Choose `"Standard Create"` and select the `PostgreSQL` engine.
4. Specify a unique identifier for your DB instance.
5. Configure instance details, such as class, storage, and VPC settings.
6. Set a secure master username and password.
7. Configure network settings and enable `"Publicly accessible"`.
8. Provide a database name and choose a port.
9. Enable `Performance Insights` and set a retention period.
10. Set backup retention to `0` and disable deletion protection.
11. Choose storage type and enable encryption.
12. Review and create the instance.

I created an RDS datbase and named it cruddurroot and I connected to Postgres via CLI. 

![RDS](assets/RDS%20week%204.jpg)

- Observe the creation progress on the RDS console and await for it to show "Available", when it does, it means it has successfully been created

```
DB instance created:
Instance ID: `cruddur-db-instance`
Engine: `PostgreSQL`
Instance Class: `db.t3.micro`
...
Status: `Creating`
```


**Creating an RDS Instance in AWS CLI**

Paste this code in you workspace CLI to create a database instance

```sh
aws rds create-db-instance \
  --db-instance-identifier cruddur-db-instance \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version  14.6 \
  --master-username <required> \
  --master-user-password <required> \
  --allocated-storage 20 \
  --availability-zone <required> \
  --backup-retention-period 0 \
  --port 5432 \
  --no-multi-az \
  --db-name cruddur \
  --storage-type gp2 \
  --publicly-accessible \
  --storage-encrypted \
  --enable-performance-insights \
  --performance-insights-retention-period 7 \
  --no-deletion-protection
```

**Make sure to**

- Choose a `master-username`
- `master-user-password` with a length between 8 and 30 characters.
- Change `availability-zone` to yours
- Access AWS RDS, navigate to the "Databases" section, and select the desired database entry.


  > 5432 is the default port used by PostgreSQL. we did this because hackers will scan for databases on the default port, so changing it might reduce the number of attacks targeting to your database.

---

## PSQL Commands 

This is where we will be creating the database for cruddur

1. Run the following command in a terminal:
```
docker compose up
```
2. A password will have been created, Connect with the password `password`

```bash
gitpod /workspace/aws-cloud-project-bootcamp (main) $ psql -Upostgres -h localhost
```
3. Run the create database code to create your own database, for instance;

```sql
CREATE DATABASE database_name; 
```
4. Discard the database if it's no longer required.
```sql
DROP DATABASE database_name;
```

Additionally, you can execute with the right commands the detials of your database and it's as follows;

| Command                | Description                                                  | Example |
|------------------------|--------------------------------------------------------------|---------|
| `\x`                   | Enable expanded display when viewing data.                  | `\x on` |
| `\q`                   | Quit the PSQL command-line interface.                       | `\q`    |
| `\l`                   | List all available databases.                               | `\l`    |
| `\c database_name`     | Connect to a specific database.                             | `\c database_name` |
| `\dt`                  | List all tables in the current database.                   | `\dt`   |
| `\d table_name`        | Describe a specific table's structure.                      | `\d table_name` |
| `\du`                  | List all users and their roles.                             | `\du`   |
| `\dn`                  | List all schemas in the current database.                   | `\dn`   |

<details>

<summary>
5. Here's more informations tp educate you on PSQL  <b> inside.</b>
</summary>
  
| Command         | Description                                                                                              | Example SQL                                   |
|-----------------|----------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| SELECT          | Retrieve data from a database.                                                                          | `SELECT column1, column2 FROM table_name;`    |
| INSERT          | Add new records into a table.                                                                           | `INSERT INTO table_name (column1, column2) VALUES (value1, value2);` |
| UPDATE          | Modify existing records in a table.                                                                     | `UPDATE table_name SET column1 = value1 WHERE condition;` |
| DELETE          | Remove records from a table.                                                                            | `DELETE FROM table_name WHERE condition;`     |
| CREATE TABLE    | Create a new table in the database.                                                                     | ```sql CREATE TABLE table_name ( column1 datatype, column2 datatype, ... ); ``` |
| ALTER TABLE     | Modify an existing table (add, modify, or delete columns).                                            | ```sql ALTER TABLE table_name ADD column_name datatype; ```<br> ```sql ALTER TABLE table_name MODIFY column_name datatype; ```<br> ```sql ALTER TABLE table_name DROP COLUMN column_name; ``` |
| DROP TABLE      | Delete a table and its data.                                                                            | `DROP TABLE table_name;`                     |
| CREATE INDEX    | Create an index on columns to improve query performance.                                               | `CREATE INDEX index_name ON table_name (column_name);` |
| ALTER INDEX     | Modify an existing index.                                                                               | `ALTER INDEX index_name REBUILD;`            |
| JOIN            | Combine rows from multiple tables based on related columns.                                           | `SELECT column1, column2 FROM table1 INNER JOIN table2 ON table1.column = table2.column;` |
| GROUP BY        | Group rows with the same values in specified columns.                                                 | `SELECT column1, COUNT(*) FROM table_name GROUP BY column1;` |
| HAVING          | Filter results of aggregate functions in combination with GROUP BY.                                  | `SELECT column1, COUNT(*) FROM table_name GROUP BY column1 HAVING COUNT(*) > 5;` |
| ORDER BY        | Sort the result set by one or more columns.                                                           | `SELECT column1, column2 FROM table_name ORDER BY column1 ASC, column2 DESC;` |
| UNION           | Combine result sets of multiple SELECT statements (removes duplicates).                              | `SELECT column1 FROM table1 UNION SELECT column1 FROM table2;` |
| UNION ALL       | Similar to UNION, but includes duplicate rows.                                                        | `SELECT column1 FROM table1 UNION ALL SELECT column1 FROM table2;` |

</details>

### Database for Cruddur

1. Here we are actually creating our database, we start by running this code in our terminal in creating one

```sql
CREATE database cruddur;
```
2. Inside the psql shell, run `\l` to list DBs.
```bash
List of databases
   Name    |  Owner   | Encoding |  Collate   |   Ctype    |   Access privileges   
-----------+----------+----------+------------+------------+-----------------------
 cruddur   | postgres | UTF8     | en_US.utf8 | en_US.utf8 | 
 postgres  | postgres | UTF8     | en_US.utf8 | en_US.utf8 |
 template0 | postgres | UTF8     | en_US.utf8 | en_US.utf8 | =c/postgres          +
```

NOTE: To create databases for our application, it is required to have a SQL file that defines its schema.

## PSQL Schema

A `schema.sql` file is a set of instructions written in SQL (Structured Query Language) that outlines the structure and organization of a database. In this file, you define the `tables`, their `columns`, data `types`, `constraints`, `relationships`, and other relevant database `elements`.

**Step for Schema :** In `backend-flask/db`, create a `schema.sql` file.
- [Step 1 : PostgreSQL UUID](#step-1--postgresql-uuid)
- [Step 2 : Load Intial PSQL Schema](#step-2--load-intial-psql-schema)
- [Step 3 : Expand Dropping Tables](#step-3-expand-dropping-tables)
- [Step 4 : Creating the `users` Table](#step-4-creating-the-users-table)
- [Step 5 : Creating the `activities` Table](#step-5-creating-the-activities-table)
- [Step 6 : Schema Successfully Established](#step-6-schema-successfully-established)
- [Step 7 : RELOAD SQL Schema ](#step-7-reload-sql-schema)


### Step 1 : PostgreSQL UUID

Include the following line within the file to enable the UUID extension for PostgreSQL.
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

We'll use `uuid-ossp` to enable PostgreSQL to generate UUIDs.

`UUIDs enhances uniqueness and reduces the likelihood of ID collisions when compared to numeric IDs`


### Step 2 : Load Intial PSQL Schema

1. **Quit `psql`:** If you have a psql session open, close it by typing the command:

```psql
\q
```
This will exit the current `psql` session.

2. **Load schema.sql**: go to the `backend` folder in your project directory and run the following command:

```bash
psql cruddur < db/schema.sql -h localhost -U postgres
```
- `psql`: This is the **PostgreSQL command line tool** used to interact with the PostgreSQL database server.
- `cruddur`: This is the **name of the database** you want to connect to.
- `< db/schema.sql`: This indicates that you want to input the **contents of the `schema.sql` file** into the `psql` command.
- `-h localhost`: This specifies the **host** (in this case, your local machine).
- `-U postgres`: This specifies the **PostgreSQL username** to use (in this case, "postgres").

3. **Password Prompt:** When you run the command, you'll be prompted to enter the password for the "postgres" user. Enter the correct password associated with the "postgres" user equals `password`.

4. **Terminal Output:** the schema file should load as successful

 ```sql
$ psql cruddur < db/schema.sql -h localhost -U postgres 
 ```


This output indicates that the commands in the `schema.sql` have been executed, including creating extension.

### Step 3: Expand Dropping Tables

Start by dropping two tables `public.users` and `public.activities` if they already exist in the database. This ensures that any previous versions of these tables are removed before creating new ones.
```sql
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.activities;
```
The `DROP TABLE IF EXISTS` statement is used to delete the specified table if it exists. The public in `public.users` and `public.activities` indicates the schema where the tables are located.

### Step 4: Creating the `users` Table

Create a new table called `users` in the public schema. This table will store information about users.

```sql
CREATE TABLE public.users (
  uuid UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  display_name text NOT NULL,
  handle text NOT NULL,
  email text NOT NULL,
  cognito_user_id text NOT NULL,
  created_at TIMESTAMP default current_timestamp NOT NULL
);
```
Here's a breakdown of the columns in the users table
- **uuid**: A `UUID` (Universally Unique Identifier) column with a default value generated using `uuid_generate_v4()`. This column is set as the primary key of the table.
- **display_name**: A `text` column that stores the display name of the user. It cannot be `NULL` (i.e., it's a required field).
- **handle**: A `text` column that stores a handle or username for the user. It cannot be `NULL`.
- **email**: A `text` column that stores the email address of the user. It cannot be `NULL`.
- **cognito_user_id**: A `text` column that stores an identifier associated with the user in Amazon Cognito (a service for managing user identities). It cannot be `NULL`.
- **created_at**: A `TIMESTAMP` column that stores the timestamp of when the user record was created. It has a default value of the current timestamp and cannot be `NULL`.

### Step 5: Creating the `activities` Table

Create a table called activities in the public schema. This table will store information about various activities.
```SQL
CREATE TABLE public.activities (
  uuid UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_uuid UUID NOT NULL,
  message text NOT NULL,
  replies_count integer DEFAULT 0,
  reposts_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  reply_to_activity_uuid integer,
  expires_at TIMESTAMP,
  created_at TIMESTAMP default current_timestamp NOT NULL
);
```
- **uuid**: A `UUID` column with a default value generated using `uuid_generate_v4()`. This column is set as the primary key of the table.
- **user_uuid**: A `UUID` column that stores the UUID of the user associated with the activity. It cannot be `NULL`.
- **message**: A `text` column that stores the message or content of the activity. It cannot be `NULL`.
- **replies_count**, **reposts_count**, **likes_count**: Integer columns that store the counts of replies, reposts, and likes for the activity, respectively. They have default values of 0.
- **reply_to_activity_uuid**: An `integer` column that stores the ID of the activity to which this activity is a reply. It allows for creating a hierarchical structure of activities.
- **expires_at**: A `TIMESTAMP` column that stores the expiration timestamp of the activity (if applicable).
- **created_at**: A `TIMESTAMP` column that stores the timestamp of when the activity record was created. It has a default value of the current timestamp and cannot be `NULL`.

### Step 6: Schema Successfully Established
Review your design, Mr. Database Architect, and ensure its alignment with the following structure and adequately meets your business requirements.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS public.users;
CREATE TABLE public.users (
  uuid UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  display_name text NOT NULL,
  handle text NOT NULL,
  email text NOT NULL,
  cognito_user_id text NOT NULL,
  created_at TIMESTAMP default current_timestamp NOT NULL
);

DROP TABLE IF EXISTS public.activities;
CREATE TABLE public.activities (
  uuid UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_uuid UUID NOT NULL,
  message text NOT NULL,
  replies_count integer DEFAULT 0,
  reposts_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  reply_to_activity_uuid integer,
  expires_at TIMESTAMP,
  created_at TIMESTAMP default current_timestamp NOT NULL
);
```

Schema is like the excel file, tables /views are like the sheets in it.

### Step 7: RELOAD SQL Schema 

Once we have successfully refined our schema, it's time to reload it along with the newly created tables for activities and users.

- **Load `schema.sql`**: run the following command again
```bash
psql cruddur < db/schema.sql -h localhost -U postgres
```

 ```
Password for user postgres: 

CREATE EXTENSION 
 ```

- Verify by listing the current relations in your psql using `\dt` 


Now, you have the `public.users` and `public.activities` tables ready to store data for your application along the previously loaded extension.

---


## Connecting To PSQL in Gitpod for Local and Production

Firstly we setting PostgreSQL development and production connection URLs to environment variables, to aid  the process of connecting to our database

**Local  Container PostgreSQL**

1. Write and paste the following code to initiate a connection with your database:

```bash
psql "postgresql://postgres:password@localhost:5432/cruddur"
```

2. Export the PostgreSQL connection URL as an environment variable.

```bash
export CONNECTION_URL="postgresql://postgres:password@localhost:5432/cruddur"
```
This will not only simplify the connection process through the environment variable but also enhance the convenience of utilizing it in our upcoming scripts.

3. Save the variables for futuristic Gitpod workspaces.

```bash
gp env CONNECTION_URL="postgresql://postgres:password@localhost:5432/cruddur"
```

4. Run the following command to examine the connectivity URL

```bash
psql $CONNECTION_URL
```

5. Familiarize with the schema design by running the following command

```psql
\dt
```
```
           List of relations
 Schema |    Name    | Type  |  Owner   
--------+------------+-------+----------
 public | activities | table | postgres
 public | users      | table | postgres
```

**Production PostgreSQL**<br>

Following the local contianer connection, we will do same Connection URL for the RDS instance in prod

- First, Set and persist the connection URL for the production RDS DB;

```bash
export PROD_CONNECTION_URL="postgresql://cruddurroot:<password>@<DB_endpoint>:5432/cruddur"

gp env PROD_CONNECTION_URL="postgresql://cruddurroot:<password>@<DB_endpoint>:5432/cruddur"
```


Try running the following to connect to prod.
```
psql $PROD_CONNECTION_URL
```
The command will hang indefinitely because the default security group on our RDS instance is configured to allow inbound access exclusively from the security group itself, preventing any external connections.

Here are steps for Initiating Connection to Production Database

### Step 1: Set Environment Variable

In your GitPod environment, set the `PROD_CONNECTION_URL` environment variable like this:

```sh
export PROD_CONNECTION_URL="postgresql://<user>:<password>@<RDS>:5432/<master-db-name>"
gp env PROD_CONNECTION_URL="postgresql://<user>:<password>@<RDS>:5432/<master-db-name>"
```

### Step 2: Adjust Security Group Inbound Rules

1. Connect to your AWS RDS console.
2. Modify the security group inbound rules to allow Gitpod's IP address to connect to your database.
3. Get the Gitpod IP address using the command:

```sh
GITPOD_IP=$(curl ifconfig.me)
```
4. Add an inbound rule to the RDS security group for the Gitpod IP address (`$GITPOD_IP`).


### Step 3: Test Database Connection

1. Run the command:
```sh
psql $PROD_CONNECTION_URL
```
2.  Run the `\l` command to list prod databases.

The existing configuration requires us to manually update the IP address each time.

### Step 4: Security Group Update

1. Set environment variables for the security group and the inbound rule:

```sh
export DB_SG_ID="<security-group-id>"
export DB_SG_RULE_ID="<security-group-rule-id>"

gp env DB_SG_ID="<security-group-id>"
gp env DB_SG_RULE_ID="<security-group-rule-id>"
```
- Use `DB_SG_ID` to refer to the ID of the security group itself.
- Use `DB_SG_RULE_ID` for the unique identifier of the inbound rule we've configured in the security group.

2. Use the following CLI script to update the security group rule with the Gitpod IP address:

```sh
aws ec2 modify-security-group-rules \
    --group-id $DB_SG_ID \
    --security-group-rules "SecurityGroupRuleId=$DB_SG_RULE_ID,SecurityGroupRule={Description=GITPOD,IpProtocol=tcp,FromPort=5432,ToPort=5432,CidrIpv4=$GITPOD_IP/32}"
```
3. Verify it returns the following

```
{
    "Return": true
}
```
4. Verify the ip is updated in the console


### Step 5: Automate Security Group Update

1. Create a file named `rds-update-sg-rule` inside the `/bin` with the following content:
```sh
#! /usr/bin/bash

aws ec2 modify-security-group-rules \
    --group-id $DB_SG_ID \
    --security-group-rules "SecurityGroupRuleId=$DB_SG_RULE_ID,SecurityGroupRule={Description=GITPOD,IpProtocol=tcp,FromPort=5432,ToPort=5432,CidrIpv4=$GITPOD_IP/32}"
```
I got the security group rule ID so I can easily modify it in the future from the terminal here in Gitpod.

```sh
export DB_SG_ID="sg-0b725ebab7e25635e"
gp env DB_SG_ID="sg-0b725ebab7e25635e"
export DB_SG_RULE_ID="sgr-070061bba156cfa88"
gp env DB_SG_RULE_ID="sgr-070061bba156cfa88"
```

2. Make the script executable so that each time you initiate the command, updates are prompt in the console 

```
chmod u+x rds-update-sg-rule
```

3. Update `gitpod.yml` to run the script on environment startup part of postgre setup:

```yaml
- name: postgres
  init: |
      # check the file.
  command: |
    export GITPOD_IP=$(curl ifconfig.me)
    source "$THEIA_WORKSPACE_ROOT/backend-flask/bin/rds-update-sg-rule"
```

### Step 6: Load Schema to RDS

1. Update the Docker Compose connection URL to the production URL in `docker-compose.yml`:
```
CONNECTION_URL: "${PROD_CONNECTION_URL}"
```
2. Run the `db-schema-load` script in production:
```
./backend-flask/bin/db-schema-load prod
```

### Step 7: Test Prod Connection and Schema
1. Update `./bin/db-connect` to include a condition for the 'prod' parameter.
2. Test connectivity to the production database by running the script.
```
./bin/db-connect prod
```
```bash
bin/db-connect prod
running in production
psql (13.10 (Ubuntu 13.10-1.pgdg22.04+1), server 14.6)
WARNING: psql major version 13, server major version 14.
         Some psql features might not work.
SSL connection (protocol: TLSv1.2, cipher: ECDHE-RSA-AES256-GCM-SHA384, bits: 256, compression: off)
Type "help" for help.

cruddur=>
```

---

### Bash Scripts for Our Database Operations


Bin is short form for binary, I asked the terminal where my bash is 
```sh
whereis bash`
```

This section comprises of setting up bash scripts and files to manage our database operations, such as creating and dropping databases, loading schemas, and seeding data. 

### Step 1: Organize Script Files

1. Begin by creating a new directory called bin within your backend project's root directory. This directory will store all your bash scripts related to database operations.
```
mkdir bin
```
2. Inside the bin directory, create the file structure provided.
```sh
touch bin/db-create
touch bin/db-drop
touch bin/db-connect
touch bin/db-sessions
touch bin/db-setup
touch bin/db-seed
touch bin/db-schema-load
touch bin/db-rds-update-sg-rule
```

### Step 2: Add Shebang and Permissions

1. For each script file, add the shebang line at the top to indicate that the script should be executed with Bash.
```sh
#! /usr/bin/bash
```

2. Make all the script files executable by running the following command for each file:
```sh
chmod u+x bin/<filename>
```
3. You can apply to all the bin directory in one command to all files:

```sh
chmod -R u+x bin/
```

### Step 3: Implement Database Operation Scripts

1. Develop `db-create` script
```sh
#! /usr/bin/bash

NO_DB_CONNECTION=$(sed 's/\/cruddur//g' <<< "$CONNECTION_URL")
psql $NO_DB_CONNECTION -c "create database cruddur;"
```
- `First`: Uses the `sed` command to extract a modified version of the `CONNECTION_URL`. This modified URL removes the trailing "/cruddur" segment from the connection URL. The modified URL is stored in the `NO_DB_CONNECTION` variable.
- `Second`: Executes the `psql` command to create a new database named "cruddur" using the modified connection URL stored in the `NO_DB_CONNECTION` variable. The `-c` flag specifies a command to be executed within `psql`.

```SQL
sed 's/\/cruddur//g'
```
To get rid of `/` do `\` infront of it

for this `/cruddur//` It will take it and change it with empty using `//`

Now let's add it to our connection string:

```SQL
sed 's/\/cruddur//g' <<< "$CONNECTION_URL"
```

WRAPPING in dollar sign so we can assign it to our env var

```SQL
NO_DB_CONNECTION=$(sed 's/\/cruddur//g' <<< "$CONNECTION_URL"
```

2. Develop `db-drop` script

```sh
#! /usr/bin/bash

NO_DB_CONNECTION_URL=$(sed 's/\/cruddur//g' <<<"$CONNECTION_URL")
psql $NO_DB_CONNECTION_URL -c "drop database IF EXISTS cruddur;"
```
- `First`: Modify `CONNECTION_URL` to remove "/cruddur" segment, store in `NO_DB_CONNECTION_URL`.
- `Second`: Drop database "cruddur" using modified URL, if exists.

3. Develop `db-connect` script

```sh
#! /usr/bin/bash

if [ "$1" = "prod" ]; then
  echo "using production"
  URL=$PRODUCTION_URL
else
  URL=$CONNECTION_URL
fi

psql $URL
```
   - Determine connection URL based on argument:
     - If argument is "prod," use production URL.
     - Otherwise, use default connection URL.
   - Use the determined URL to connect using `psql`.
```bash
./bin/db-connect
psql (13.10 (Ubuntu 13.10-1.pgdg22.04+1))
Type "help" for help.


cruddur=#
```
4. Develop `db-sessions` script
```sh
#! /usr/bin/bash


if [ "$1" = "prod" ]; then
  echo "using production"
  CONNECTION_URL=$PROD_CONNECTION_URL
else
  CONNECTION_URL=$CONNECTION_URL
fi

NO_DB_URL=$(sed 's/\/cruddur//g' <<<"$CONNECTION_URL")
psql $NO_DB_URL -c "select pid as process_id, \
       usename as user,  \
       datname as db, \
       client_addr, \
       application_name as app,\
       state \
from pg_stat_activity;"
```
- Determine connection URL based on argument:
  - If argument is "prod," use production connection URL.
  - Otherwise, use default connection URL.
- Modify the determined connection URL, store in `NO_DB_URL`.
- Use `psql` to execute a SQL query that retrieves process information from the PostgreSQL `pg_stat_activity` view.


5. Develop `seed.sql` for the testing data.

```SQL
-- this file was manually created

INSERT INTO
    public.users (
        display_name,
        handle,
        cognito_user_id
    )
VALUES  (
        'Nwalie Chinyere',
        'nwaliechinyere',
        'MOCK'
    );

INSERT INTO
    public.activities (user_uuid, message, expires_at)
VALUES ( (
            SELECT uuid
            from public.users
            WHERE
                users.handle = 'nwaliechinyere'
            LIMIT
                1
        ), 'This was imported as seed data!', current_timestamp + interval '10 day'
    )
```
6. Develop `db-seed` script to seed the above.
```sh
#! /usr/bin/bash

ABS_PATH=$(readlink -f "$0")
DB_PATH=$(dirname $ABS_PATH)
BIN_PATH=$(dirname $DB_PATH)
PROJECT_PATH=$(dirname $BIN_PATH)
BACKEND_FLASK_PATH="$PROJECT_PATH/backend-flask"
seed_path="$BACKEND_FLASK_PATH/db/seed.sql"
echo $seed_path

if [ "$1" = "prod" ]; then
  echo "using production"
  CONNECTION_URL=$PRODUCTION_URL
else
  CONNECTION_URL=$CONNECTION_URL
fi

psql $CONNECTION_URL cruddur < $seed_path
```
- Get script's absolute path, store in `ABS_PATH`.
- Derive script's directory path, store in `DB_PATH`.
- Derive bin directory path, store in `BIN_PATH`.
- Derive project directory path, store in `PROJECT_PATH`.
- Define Flask project path in `BACKEND_FLASK_PATH`.
- Define seed SQL file path in `seed_path`.
- Echo `seed_path` to console.
- Determine connection URL based on provided argument:
  - If `prod,` use production connection URL.
  - Else, use default connection URL.
- Use psql to execute seed SQL file on specified database (cruddur) using determined connection URL.
```sql
./bin/db-seed
== db-seed
db-seed
running in development
INSERT 0 2
INSERT 0 1
```
6. Develop `db-schema-load` script
```sh
#! /usr/bin/bash

ABS_PATH=$(readlink -f "$0")
DB_PATH=$(dirname $ABS_PATH)
BIN_PATH=$(dirname $DB_PATH)
PROJECT_PATH=$(dirname $BIN_PATH)
BACKEND_FLASK_PATH="$PROJECT_PATH/backend-flask"
schema_path="$BACKEND_FLASK_PATH/db/schema.sql"
echo $schema_path

if [ "$1" = "prod" ]; then
  echo "using production"
  CONNECTION_URL=$PRODUCTION_URL
else
  CONNECTION_URL=$CONNECTION_URL
fi


psql $CONNECTION_URL cruddur < $schema_path
```
- Get absolute path as `ABS_PATH`.
- Derive script's directory as `DB_PATH`.
- Define Flask project path as `BACKEND_FLASK_PATH`.
- Determine connection URL based on argument as `CONNECTION_URL`.
- Define schema file path as `schema_path`.
- Echo schema path.
- If argument is "prod," use production URL.
- Use `psql` to apply schema setup using determined URL.


### Step 4: Organizing our Scripts 

We'll prganize the scripts needed to set up PostgreSQL each time, simplifying the process of configuring psql for future workspaces.

- Develop `db-setup` script
```sh
#! /usr/bin/bash
set -e # stop it if it failed at any stage

ABS_PATH=$(readlink -f "$0")
DB_PATH=$(dirname $ABS_PATH)

source "$DB_PATH/drop"
source "$DB_PATH/create"
source "$DB_PATH/schema-load"
source "$DB_PATH/seed"
python "$DB_PATH/migrate"
python "$DB_PATH/update_cognito_user_ids"
```

This script is designed to automate the process of managing a database. It performs several essential tasks related to the database setup and maintenance.

- `source "$DB_PATH/drop"`: Executes a script to drop an existing database.
- `source "$DB_PATH/create"`: Executes a script to create a new database.
- `source "$DB_PATH/schema-load"`: Executes a script to load the database schema.
- `source "$DB_PATH/seed"`: Executes a script to populate the database with initial data.
- `python "$DB_PATH/migrate"`: Executes a Python script named `migrate` for database migrations.
- `python "$DB_PATH/update_cognito_user_ids"`: Executes a Python script for updating user IDs cognito

---

## Further Implementations for PostgreSQL 

Currently, the data we have access to is in a simulated state, but In order to retrieve actual information from our database essentially making a connection between PostgreSQL and Python, we need to develop a PostgreSQL client specifically designed for Python integration using a database pooling.


### Step 1: Install Required Libraries
1. Add the necessary libraries to your `backend-flask/requirements.txt` file:

```
psycopg[binary]
psycopg[pool]
```

2. Install the libraries using the following command:

```
pip install -r requirements.txt
```

### Step 2: Set Environment Variable

In your `docker-compose.yml` file, set the environment variable for your backend-flask application:

```yaml
CONNECTION_URL: "postgresql://postgres:password@db:5432/cruddur"
```
**Important:** Avoid using a password that ends with the character '!' because this can lead to an issue with the URL structure. The combination of '!' and '@' in the URL might trigger errors when launching certain commands.


### Step 3: Create `db.py` Utility Library

Create a utility library named `db.py` under the `backend-flask/lib`.

- **Purpose:** This file is a utility library that manages interactions with a PostgreSQL database in the Python application.
- **Import:** The `psycopg_pool` library's `ConnectionPool` is imported to handle connection pooling.
- **Import:** The `os` module is imported to access environment variables.

```py
from psycopg_pool import ConnectionPool
import os
```
- **Function `query_wrap_object(template)`:**
  - This function wraps a provided SQL query template in a structure that fetches a single JSON object result.
  - It uses the `row_to_json` function to convert the result row into a JSON object.
  - The `COALESCE` function ensures that an empty JSON object is returned if the result is null.
```py
def query_wrap_object(template):
    sql = f"""
    (SELECT COALESCE(row_to_json(object_row),'{{}}'::json) FROM (
    {template}
    ) object_row);
    """
    return sql
```
- **Function `query_wrap_array(template)`:**
  - This function wraps a provided SQL query template in a structure that fetches a JSON array of rows.
  - It employs `array_to_json` and `array_agg` functions to convert result rows into a JSON array.
  - The `COALESCE` function handles cases where the result is null, returning an empty JSON array.
```py
def query_wrap_array(template):
    sql = f"""
    (SELECT COALESCE(array_to_json(array_agg(row_to_json(array_row))),'[]'::json) FROM (
    {template}
    ) array_row);
    """
    return sql
```
- **Connection URL:**
  - The environment variable `CONNECTION_URL` is fetched using `os.getenv`.
  - This URL is necessary for establishing a connection to the PostgreSQL database.
```py
connection_url = os.getenv("CONNECTION_URL")
pool = ConnectionPool(connection_url)
```

- **Connection Pool:**
  - The `ConnectionPool` is instantiated using the fetched `CONNECTION_URL`.
  - Connection pooling optimizes database connections for efficiency and performance.


### Step 4: Integrate `db.py` into Activities

1. Import the required functions and objects from `db.py` into your `home_activities`:

```py
from lib.db import pool, query_wrap_array
```
2. Run a basic query

3. Observer the current SQL and examine the user interface.

4. Design the required to retrieve specific columns from two tables: `activities` and `users`

```SQL
SELECT
  activities.uuid,
  users.display_name,
  users.handle,
  activities.message,
  activities.replies_count,
  activities.reposts_count,
  activities.likes_count,
  activities.reply_to_activity_uuid,
  activities.expires_at,
  activities.created_at
FROM public.activities
LEFT JOIN public.users ON users.uuid = activities.user_uuid
ORDER BY activities.created_at DESC
```
- Columns being retrieved:
  - `activities.uuid`: Unique identifier for each activity.
  - `users.display_name`: Display name of the user associated with the activity.
  - `users.handle`: User's handle or username.
  - `activities.message`: Content or message of the activity.
  - `activities.replies_count`: Number of replies received by the activity.
  - `activities.reposts_count`: Number of times the activity has been reposted.
  - `activities.likes_count`: Number of likes received by the activity.
  - `activities.reply_to_activity_uuid`: UUID of the activity to which this activity is a reply.
  - `activities.expires_at`: Expiry date of the activity.
  - `activities.created_at`: Timestamp of when the activity was created.
- The `LEFT JOIN` operation connects the `users` table with the `activities` table using the UUIDs, linking user information to each activity.
- The results are ordered by the `created_at` timestamp in descending order.

5. Pass it to sql and create multi-line strings with `"""`

```
sql = """
  QUERY GOES HERE
 """
```
- Using triple quotes eliminates the need to escape line breaks or other special characters within the query.

6. Print the SQL to help you up verify the query and debug any issues.
```
print(sql)
```

7. Fetch data from a database, and handling the results. 
```py
span.set_attribute("app.result_length", len(results))
with pool.connection() as conn:
    with conn.cursor() as cur:
        cur.execute(sql)
        json = cur.fetchall()
return json[0]
```
- Sets an attribute related to the length of query results.
- Establishes a connection to the database using a connection pool.
- Creates a cursor to interact with the database.
- Executes the SQL query using the cursor.
- Fetches all results from the executed query.
- Returns the first row of fetched data as a tuple.

This process effectively retrieves data from the database, processes it, and returns a specific data point for further handling or display.

8. Replace the existing code in the `home_activities` script with the code we just created.

```py
sql = """
      SELECT
        activities.uuid,
        users.display_name,
        users.handle,
        activities.message,
        activities.replies_count,
        activities.reposts_count,
        activities.likes_count,
        activities.reply_to_activity_uuid,
        activities.expires_at,
        activities.created_at
      FROM public.activities
      LEFT JOIN public.users ON users.uuid = activities.user_uuid
      ORDER BY activities.created_at DESC
      """
print(sql)
span.set_attribute("app.result_length", len(results))
with pool.connection() as conn:
    with conn.cursor() as cur:
        cur.execute(sql)
        json = cur.fetchall()
return json[0]
```

### Step 5: Refactor API Call in home_activities

Refactor the API call in the `home_activities` script to load SQL templates and query data using the functions from `db.py`:

```py
sql = db.load_template('activities', 'home')
params = {}
results = db.query_array_json(sql, params)
return results
```

### Step 6: Verify and Test
After composing your Docker containers, the home page should display activity data from the `db/seed.sql` file instead of mock data.

---

### AWS Lambda 

Upon user sign-ups , we lay their entry into the users table. To achieve this, we are considering the implementation of an AWS Lambda function that triggers the user sign up process and store it in RDS.

-> STEPS;

### Step 1: Create Lambda Function

1. Go to the AWS Management Console.
2. Open the Lambda service.
3. Click on "Create function."
4. Choose "Author from scratch."
5. Provide the function name as `cognito-post-confirm-function` and select runtime as "Python 3.8."
6. Keep the default settings for other configurations and click "Create function."


### Step 2: Configure Environment Variables

1. In the Lambda function's configuration, go to the "Environment variables" section.
2. Add a new variable with the key as `CONNECTION_URL` and the value as your `PROD_CONNECTION_URL`.
3. In your `docker-compose.yml` make backend environment as follows:

```
    CONNECTION_URL: "${PROD_CONNECTION_URL}"
```

### Step 3: Add `Psycopg2` Layer

PostgreSQL libraries being unavailable in the AWS Lambda AMI image, it was necessary for us to undertake the compilation of psycopg2 along with the inclusion of the PostgreSQL libpq.
1. In the "Layers" section of the Lambda configuration, click on "Add a layer."
2. Use the ARN of Psycopg2 layer to your Lambda function: 

```sh
arn:aws:lambda:us-east-1:AWS-ACCOUNT-ID:layer:psycopg2-py38:2
```

### Step 4: Connect Lambda to VPC

1. Open the Functions page of the Lambda console.
2. Choose a function.
3. Choose Configuration go to Network
4. Under Network, choose Edit.
5. Choose the VPC.<


### Step 5: Create Lambda Code


1. Start by the import of the Required Modules

```py
import json
import psycopg2
import os
```
Here the necessary modules are imported: `json` for JSON manipulation, `psycopg2` for PostgreSQL database interaction, and `os` for accessing environment variables.

2. Define the Lambda Handler

```py
def lambda_handler(event, context):
```
The `lambda_handler` function is the entry point for the Lambda function. It takes two arguments, `event` (containing input data) and `context` (Lambda runtime information).

3. Extract User Attributes

```py
    user = event["request"]["userAttributes"]
```
Here, the user attributes are extracted from the incoming `event` dictionary.

4. Establish Database Connection

```py
    try:
        conn = psycopg2.connect(os.getenv("CONNECTION_URL"))
        cur = conn.cursor()
```
a connection to the PostgreSQL database is established using the connection URL retrieved from the environment variables. A cursor object is created to execute SQL commands.

5. Prepare SQL Parameters using a Parameters List

```sql
parameters = [
    user["name"],
    user["email"],
    user["preferred_username"],
    user["sub"],
]

sql = f"INSERT INTO public.users (display_name, email, handle, cognito_user_id) VALUES (%s, %s, %s, %s)"
```
In this part, a list of parameters is created from the extracted user attributes. The SQL command for insertion is prepared using placeholders to avoid SQL injection.

6. Or Assigning Variables Directly

```sql
user_display_name  = user['name']
user_email         = user['email']
user_handle        = user['preferred_username']
user_cognito_id    = user['sub']

sql = f"""
  INSERT INTO public.users(
    display_name,
    email, 
    handle, 
    cognito_user_id)
  VALUES ( %s, %s, %s, %s)
"""
```
Both approaches achieve the same result. <br>
This one provides better comprehension and allows you to use more descriptive variable names, making the code more self-explanatory. 

7. Execute SQL Command

```py
cur.execute(sql, *parameters)
```
The SQL command is executed using the cursor, and the parameters are passed in to complete the insertion operation.

8. Commit Changes and Handle Exceptions

```py
    conn.commit()

except (Exception, psycopg2.DatabaseError) as error:
    print(error)
```
The changes are committed to the database. If an exception occurs during the database interaction, the error is printed.

9. Close Database Connection
```py
finally:
    if conn is not None:
        cur.close()
        conn.close()
        print("Database connection closed.")
```
In the `finally` block, the cursor and connection are closed to ensure proper resource management.

10.  Return Event
```py
return event
```

The Lambda function concludes by returning the `event` dictionary.

11. After undergoing rigorous development, your function's code now appears as follows:


```python
import json
import psycopg2
import os

def lambda_handler(event, context):
    user = event['request']['userAttributes']
    user_display_name  = user['name']
    user_email         = user['email']
    user_handle        = user['preferred_username']
    user_cognito_id    = user['sub']
    
    sql = f"""
      INSERT INTO public.users(
        display_name,
        email, 
        handle, 
        cognito_user_id)
      VALUES ( %s, %s, %s, %s)
    """

    params = [user_display_name, user_email, user_handle, user_cognito_id]
    
    try:
        conn = psycopg2.connect(os.getenv('CONNECTION_URL'))
        cur = conn.cursor()
        cur.execute(sql, *params)
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


Remember to replace `CONNECTION_URL` with the actual environment variable name that holds your PostgreSQL connection URL.


### Step 6: Configure Execution Role Permissions
1. Create a policy named `LambdaVPCAccessPolicy` in IAM Policies. You can employ this right away.


```python
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:CreateNetworkInterface",
                "ec2:DeleteNetworkInterface",
                "ec2:DescribeNetworkInterfaces"
                ],
                "Resource": "*"
        }]
}
```


2. Attach the `LambdaVPCAccessPolicy` policy to the execution role of your Lambda function.


### Step 7: Deploy Lambda Function

1. In the Lambda function's configuration, click "Deploy" to deploy the code.


That's what the step about. Deploy your Lambda when It is ready


### Step 8: Configure Cognito Trigger

1. Open your AWS Cognito User Pool settings.
2. Under the "Triggers" tab, configure a trigger for "Post Confirmation."
3. Go to User Pool Properties.
4. Assign the previously created Lambda function (`cognito-post-confirm-function`) to this trigger.
5. Click Add Lambda Trigger.


### Step 9: Testing and Verifying

1. Ensure your Docker environment is up using `docker-compose up`.
2. Load the production database schema using `./bin/db-schema-load prod`.
3. Sign up to the Cruddur web app.
4. Connect to the prod DB using `./bin/db-connect prod`
5. Verify that the newly signed-up user is added to the users table using the database command:

```sql
SELECT * FROM users;
```

```bash
cruddur=> 
-[ RECORD 1 ]---+-------------------------------------
uuid            | UUID1
display_name    | Nwalie Chinyere
handle          | nwaliechinyere
email           | nwalie..@..
cognito_user_id | UUID2
created_at      | DATE TIME.ID
```

### Step 10 : Post Verify

We can ensure absolute certainty regarding this process by consulting the CloudWatch logs.
1. Open `CloudWatch`.
2. Navigate to `Log groups`.
3. Select `/aws/lambda/cruddur-post-confirmation`.
4. Review the logs displayed.

---

### User Activities for Cruddur

We are establishing activity feed; this will involve incorporating a database insert to enable the creation of new activities.

Please proceed to the psql interface and examine the contents of the activities table.

1. Start Your RDS Instance and Connect to the psql prod
3. List the activities

```sh
cruddur=# SELECT * FROM activities;
-[ RECORD 1 ]----------+-------------------------------------
```


### Step 1: Develop `home_activities.py` SQL Query

1. Inside the 'HomeActivities' class Load an SQL query template for retrieving home activity data
```py
        sql = db.load_template('activities', 'home')
        params = {}
```
2. Query the database for activity data using the template and parameters
```py
        results = db.query_array_json(sql, params)
```
3. Return the retrieved activity data with `return results` and compare your code with mine.

```py
from datetime import datetime, timedelta, timezone
from lib.db import db

class HomeActivities:
    def run(logger, cognito_user_id=None):
        sql = db.load_template('activities', 'home')
        params = {}

        results = db.query_array_json(sql, params)

        return results
```

* **Import Statement**: The import for `db` from `lib.db` is included to enable database-related operations.
* **SQL Query Template**: The line `sql = db.load_template('activities', 'home')` loads the SQL query template for retrieving home activity data. The template name is `'home'`, which is specific to retrieving activity data for the home page.
* **Parameters**: The `params` dictionary is kept empty, as it appears that no specific parameters are being passed to the SQL query template for the home activity.
* **Database Query**: The line `results = db.query_array_json(sql, params)` executes the SQL query using the loaded template and parameters. It retrieves an array of activity data in JSON format.
* **Result Return**: The variable `results` contains the retrieved activity data, which is then returned from the `run()` method.


### Step 2: Develop `create_activity.py` Endpoint

1. Create `create_activity()` method responsible for creating a new activity entry in the database
```py
   def create_activity(handle, message, expires_at):
        """
        this method creates a crud and commits in RDS
        """
        sql = db.load_template('activities', 'create')
        params = {'handle': handle, 'message': message,
                  'expires_at': expires_at}
        user_uuid = db.query_commit(sql, params)
        return user_uuid
```
   - Parameters:
       - `handle` (user handle)
       - `message` (activity message)
       - `expires_at` (expiry timestamp)
   - Generates SQL query template for activity creation.
   - Executes query and commits data to the database.
   - Returns the UUID of the new activity.

2. Create `query_object_activity(uuid)` method that retrieves details of an activity based on its UUID

```python
    def query_object_activity(activity_uuid):
        """
        select crud data to show on front-end
        """
        sql = db.load_template('activities', 'object')
        params = {'uuid': activity_uuid}
        return db.query_object_json(sql, params)
```
   - Parameter:
       - `uuid` (activity's unique identifier)
   - Generates SQL query template for selecting activity details.
   - Retrieves activity data from the database in JSON format.
   - Returns JSON representation of activity details.

3. Create `run(message, user_handle, ttl)` that coordinates the process of creating an activity, handling errors, and preparing the response model.

```py
    def run(message, user_handle, ttl):
        """
        Executes the activity creation process and prepares the model response.
        """
        model = {"errors": None, "data": None}

        now = datetime.now(timezone.utc).astimezone()

        ttl_offsets = {
            "30-days": timedelta(days=30),
            "7-days": timedelta(days=7),
            "3-days": timedelta(days=3),
            "1-day": timedelta(days=1),
            "12-hours": timedelta(hours=12),
            "3-hours": timedelta(hours=3),
            "1-hour": timedelta(hours=1)
        }

        if ttl in ttl_offsets:
            ttl_offset = ttl_offsets[ttl]
        else:
            model["errors"] = ["ttl_blank"]

        if not user_handle or len(user_handle) < 1:
            model["errors"] = ["user_handle_blank"]

        if not message or len(message) < 1:
            model["errors"] = ["message_blank"]
        elif len(message) > 280:
            model["errors"] = ["message_exceed_max_chars"]

        if model["errors"]:
            model["data"] = {"handle": user_handle, "message": message}
        else:
            expires_at = now + ttl_offset
            created_activity_uuid = CreateActivity.create_activity(user_handle, message, expires_at)

            object_json = CreateActivity.query_object_activity(created_activity_uuid)
            model["data"] = object_json
        return model
```
   - Coordinates activity creation, error handling, and response model preparation.
   - Parameters:
       - `message` (activity message)
       - `user_handle` (user's handle)
       - `ttl` (time-to-live duration)
   - Calculates current time and TTL offset based on provided value.
   - Validates input data and populates "errors" field in response model if needed.
   - Calculates expiry timestamp, creates new activity, queries details, and populates "data" field in response model.
   - Returns the prepared response model.


This `create_activity.py` ensures that the creation and querying of activities are performed using actual database operations rather than mocked data. 


### Step 3: The SQL Activity Manager

We are creating the SQL functions queries in `/db/sql` that way we are adhering to the principle of **separation of concerns, code organization, modularity, and maintainability**. 

<img src="assets/week4/7- DB Activities/6 take sql outside.png">

We are adding codes in both `home_activities.py` and `create_activity.py` .


1. `create.sql` - Inserting a New Activity —
This query is designed to insert a new activity into the database when a user initiates a new activity.


```SQL
INSERT INTO public.activities (
  user_uuid,
  message,
  expires_at
)
VALUES (
  (SELECT uuid 
    FROM public.users 
    WHERE users.handle = %(handle)s
    LIMIT 1
  ),
  %(message)s,
  %(expires_at)s
) RETURNING uuid;
```
- Adds a new activity to the database and associates it with a specific user.
- Allows users to create and contribute new activities.
- Enables tracking of user-generated content in the activity feed.

2. `home.sql` - Retrieving Activities for Home Feed
 — This query retrieves a list of activities for display in a user's home activity feed.

```SQL
SELECT
  activities.uuid,
  users.display_name,
  users.handle,
  activities.message,
  activities.replies_count,
  activities.reposts_count,
  activities.likes_count,
  activities.reply_to_activity_uuid,
  activities.expires_at,
  activities.created_at
FROM public.activities
LEFT JOIN public.users ON users.uuid = activities.user_uuid
ORDER BY activities.created_at DESC;
```
- Populates the home activity feed with a list of activities and relevant user details.
- Provides users with a personalized feed showcasing various activities.
- Facilitates user engagement and content discovery.

3. `object.sql` - Fetching a Created Activity for a User
 — This query fetches details about a specific activity created by a user, enhancing the user experience.

```SQL
SELECT
  activities.uuid,
  users.display_name,
  users.handle,
  activities.message,
  activities.created_at,
  activities.expires_at
FROM public.activities
INNER JOIN public.users ON users.uuid = activities.user_uuid 
WHERE 
  activities.uuid = %(uuid)s;
```
- Displays detailed information about an activity that a user has created.
- Allows users to view and interact with their own content easily.
- Provides a seamless way to access and manage one's own activities.


### Step 4: Create PSQL Library

We have imported the library in both files, but does it actually exist? The answer is yes, as long as we create it at this moment.

1. Create a folder named `lib` in the root directory of your project. This folder will contain your custom libraries/modules.
2. Inside the newly created `lib` folder, create a file named `db.py`.
3. Paste the provided code into the `db.py` file. This code defines a Python class called `Db` for database interactions.

```py
from psycopg_pool import ConnectionPool
import os
import re
import sys
from flask import current_app as app

class Db:
    def __init__(self):
        self.pool = ConnectionPool(os.getenv("CONNECTION_URL"))

    # ... (rest of the code)
    
    # Define all the methods and functions here
    
    # ...
    
db = Db()
```
* The code starts by importing necessary modules and classes.
* The `Db` class is defined, which contains methods to interact with the database.
* The `__init__` method initializes a connection pool using the provided connection URL.
* The class includes various methods for querying and interacting with the database.
* The `db = Db()` line creates an instance of the `Db` class, which can be used to access the database methods.

4. We're creating the required methods for our app.


5. Create **`template(self, *args)`**:

```py
def template(self, *args):
    pathing = list(
        (
            app.root_path,
            "db",
            "sql",
        )
        + args
    )
    pathing[-1] = pathing[-1] + ".sql"

    template_path = os.path.join(*pathing)

    green = "\033[92m"
    no_color = "\033[0m"
    print("\n")
    print(f"{green} Load SQL Template: {template_path} {no_color}")

    with open(template_path, "r") as f:
        template_content = f.read()
    return template_content
```

- Constructs a file path based on input arguments.
- Reads and returns the content of an SQL template file.

6. Create **`print_params(self, params)`**:

```py
def print_params(self, params):
        blue = "\033[94m"
        no_color = "\033[0m"
        print(f"{blue} SQL Params:{no_color}")
        for key, value in params.items():
            print(key, ":", value)
```
   - Prints SQL parameters for debugging purposes.

7. Create **`print_sql(self, title, sql)`**:

```py
def print_sql(self, title, sql):
    cyan = "\033[96m"
    no_color = "\033[0m"
    print(f"{cyan} SQL STATEMENT-[{title}]------{no_color}")
    print(sql)
```

- Prints an SQL statement for debugging.
- Includes a specified title before printing the SQL.

8. Create **`query_commit(self, sql, params={})`**:

```py
def query_commit(self, sql, params={}):
    self.print_sql("commit with returning", sql)

    pattern = r"\bRETURNING\b"
    is_returning_id = re.search(pattern, sql)

    try:
        with self.pool.connection() as conn:
            cur = conn.cursor()
            cur.execute(sql, params)
            if is_returning_id:
                returning_id = cur.fetchone()[0]
            conn.commit()
            if is_returning_id:
                return returning_id
    except Exception as err:
        self.print_sql_err(err)
```
   - Executes SQL queries involving changes (inserts, updates).
   - If SQL contains "RETURNING", fetches returning value and commits.
   - Commits transaction if no "RETURNING" in SQL.

9. Create **`query_array_json(self, sql, params={})`**:

```py
def query_array_json(self, sql, params={}):
    self.print_sql("array", sql)

    wrapped_sql = self.query_wrap_array(sql)
    with self.pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(wrapped_sql, params)
            json = cur.fetchone()
            return json[0]
```
   - Executes SQL query, returning a JSON array result.

10. Create **`query_object_json(self, sql, params={})`**:

```py
def query_object_json(self, sql, params={}):
      self.print_sql("json", sql)
      self.print_params(params)
      wrapped_sql = self.query_wrap_object(sql)

      with self.pool.connection() as conn:
          with conn.cursor() as cur:
              cur.execute(wrapped_sql, params)
              json = cur.fetchone()
              if json == None:
                  "{}"
              else:
                  return json[0]
```
   - Executes SQL query, returning a JSON object result.

11. Create **`query_wrap_object(self, template)`**:

```py
def query_wrap_object(self, template):
    sql = f"""
(SELECT COALESCE(row_to_json(object_row),'{{}}'::json) FROM (
{template}
) object_row);
"""
    return sql
```
- Wraps SQL template in a query converting result to JSON object.



12. Create **`query_wrap_array(self, template)`**:

```py
def query_wrap_array(self, template):
    sql = f"""
(SELECT COALESCE(array_to_json(array_agg(row_to_json(array_row))),'[]'::json) FROM (
{template}
) array_row);
"""
    return sql
```
   - Wraps SQL template in a query converting result to JSON array.

13. Create **`print_sql_err(self, err)`**:

```py
def print_sql_err(self, err):
    #  Details the exception
    err_type, err_obj, traceback = sys.exc_info()

    # get the line number when exception occured
    line_num = traceback.tb_lineno

    # print the connect() error
    print("\npsycopg ERROR:", err, "on line number:", line_num)
    print("psycopg traceback:", traceback, "-- type:", err_type)

    # print the pgcode and pgerror exceptions
    print("pgerror:", err.pgerror)
    print("pgcode:", err.pgcode, "\n")
```
- Prints PostgreSQL error details for debugging.
- The `Db` class encapsulates these methods for PostgreSQL.

14. Going back to `home_activities.py`, `create_activity.py`, etc.), you should find the import and the `db` call.

In essence, this process aids psql interactions to Cruddur by providing methods for querying, handling query results in JSON format, and assisting in debugging by printing SQL statements and parameters.

---

This is my database
![database](assets/database%20week%204.png)


---

## Troubleshooting
I had to do this Strenous process; deleting my user pool details in my cognito, then I signup in my cruddur app as a new user and below you can see the trigger.

![time out](assets/time%20out%20week4.png)

Cloud watch is essential to monitor activites, and below I am being informed what's happening.

![cloudwatch](assets/cloudwatch%20week%204.png)

At first I had a problem with this, but i rectified this issue by setting another inbound rule and set it as ``not PostgresSQL but ALL`` with my default security group since my gitpod IP will change with each new workspace and it’s only approved on port 5432 for the IP that I specify.

![inbound roles](assets/inbound%20rules.jpg)

My backed-end logs kept notifying me I had an issue with my public activities.

![public activities](assets/public%20activities%20week%204.png)

I had Seriousss issue with this for weeks, but successfully I was able to rectify it by changing the last url line in both my db-seed script and db-schema-load from ``URL=$PRODUCTION_URL`` to ``URL=$PROD_CONNECTION_URL`` 

This is because I was always loading into my schema through my local database. because connection_url is the local connection url despite the name. But since I have changed it to production url, I ought to have updated my script which i late did.

Now I signed in a new user in my cognito and it dropped in my tables.

![cognito](assets/cognito.png)

I can signin my crudder app

![cruddur](assets/Week%204%20Messages.png)

---

Next:
> Week 5 [DynamoDB and Serverless Caching](week5.md)