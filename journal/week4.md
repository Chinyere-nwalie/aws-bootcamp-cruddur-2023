# Week 4 — Postgres and RDS
created a schema.qul=uuid
createdatabase


export CONNECTION_URL="postgresql://postgres:password@localhost:5432/cruddur"
$connection_url
gp env CONNECTION_URL="postgresql://postgres:password@localhost:5432/cruddur" to save the environment



to make a new folder called bin short from for binary made 3 files db-create, drop and schema-load
we ask the terminal where our bash is `whereis bash`
we added #! /usr/bin/bash to db-create file

we allow permission and changed owne by executing this  chmod u+x bin/db-create, load , drop

