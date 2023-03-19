# Week 4 — Postgres and RDS
created a schema.qul=uuid
createdatabase


```sh
export CONNECTION_URL="postgresql://postgres:password@localhost:5432/cruddur"
$connection_url
gp env CONNECTION_URL="postgresql://postgres:password@localhost:5432/cruddur" to save the environment
```
psql postgresql://postgres:password@localhost:5432/cruddur


to make a new folder called bin short from for binary made 3 files db-create, drop and schema-load
we ask the terminal where our bash is 
```sh
whereis bash`
we added #! /usr/bin/bash to db-create file
```

we allow permission and changed owne by executing this  chmod u+x bin/db-create, load , drop

In order to access databases
```sh
echo "db-create"

NO_DB_CONNECTION_URL=$(sed 's/\/cruddur//g' <<<"$CONNECTION_URL")
psql $NO_DB_CONNECTION_URL -c "create database cruddur;"./bin/db-drop to drop database
```
we added

```sh
echo "db-schema-load"
psql $CONNECTION_URL cruddur < db/schema.sql``
to acced db-scheam-load
we ran this command ``sed 's/ / /'`` meaning what is it that you want to remove and replace
```

creating tables

Un-relational database is mysql, postgres
outbound rules state that without vpc, it can go anywhere

create a database

login with your pasword
connect all bin and db

