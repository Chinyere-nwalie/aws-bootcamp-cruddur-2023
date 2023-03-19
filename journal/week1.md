# Week 1 — App Containerization

* I added a dockerfile to my backendfile with this commands
```sh
# This code will fetch the specified python image from the docker hub
FROM python:3.10-slim-buster

WORKDIR /backend-flask

# This will copy the requirements.txt file into the image. This txt file is currently inside the backend-flask folder
COPY requirements.txt requirements.txt

# This will install all programs/softwares which is required to run our backend 
RUN pip3 install -r requirements.txt

# This will copy every folder inside the image which I am trying to make
COPY . .


ENV FLASK_ENV=development

# This will expose the port specified in our case its 4567
EXPOSE ${PORT}

# This will run our backend via flask module of python
CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=4567"]
 ```
* I made a docker container to run in the backend with these commands
```docker
docker build -t  backend-flask ./backend-flask
```

* I Built and Ran the container with these commands

```sh
To build = docker build -t  backend-flask ./backend-flask
 
To Run = docker run --rm -p 4567:4567 -it backend-flask
```
 * After running i unset them all
 ```sh
 unset FRONTEND_URL="*"
 unset BACKEND_URL="*"
```
*  I tested the backend server and made sure the port was work and public
 ```sh
 {
 curl -X GET http://localhost:4567/api/activities/home -H "Accept: application/json" -H "Content-Type: application/json"
 }
 ```
I installed npm in my Gitpod terminal

```sh
npm i
```

* I Created a Dockerfile into the frontend-react-js folder

```Dockerfile
# This will fetch the specified node image
FROM node:16.18

# This will set the environment variable 
ENV PORT=3000

# This will copy the whole frontend-reeact-js folder into the container 
COPY . /frontend-react-js

WORKDIR /frontend-react-js

# This will install the npm software/program into the container
RUN npm install

# This will expose the port
EXPOSE ${PORT}

# This will start the frontend
CMD ["npm", "start"]
```

To test the backend I ran these commands to run the frontend 
```sh
To build the image = docker build -t frontend-react-js ./frontend-react-js
To run the container exposing the port 3000 = docker run -p 3000:3000 frontend-react-js
```

* My backend containerization was a success with these commands
```sh
cd backend-flask
export FRONTEND_URL="*"
export BACKEND_URL="*"
 python3 -m flask run --host=0.0.0.0 --port=4567
 cd ..
 ```

* Also made some changes to the frontend notifications.js file, notifications.py file, app.py file and commited all changes made.
* NB: When the server refuses to load, I use the command {gp stop} in my terminal to stop the workspace and start again and it worked successfully.

- I added the dynamodb and postgres into docker compose file
 To run the dynamodb via container I added theses commands in the docker compose file
 
``yml
`dynamodb-local:
    # https://stackoverflow.com/questions/67533058/persist-local-dynamodb-data-in-volumes-lack-permission-unable-to-open-databa
    # We needed to add user:root to get this working.
    user: root
    command: "-jar DynamoDBLocal.jar -sharedDb -dbPath ./data"
    image: "amazon/dynamodb-local:latest"
    container_name: dynamodb-local
    ports:
      - "8000:8000"
    volumes:
      - "./docker/dynamodb:/home/dynamodblocal/data"
    working_dir: /home/dynamodblocal
 ```
To run the postgres via container I added these commands in the docker compose file

```yml
db:
    image: postgres:13-alpine
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - '5432:5432'
    volumes: 
      - db:/var/lib/postgresql/data
volumes:
  db:
    driver: local
 ```


# Home work Challenges
- I pushed the docker images from my Gitpod CLI to my docker hub

I achieved this by firstly creating an access token, then i login to docker in my CLI

```sh
docker login -u nwaliechinyerejessica -p accesstoken
 ```
Then I tagged the images with this commands:

```sh
docker tag ubuntu:latest  nwaliechinyerejessica/cruddur-backend
docker tag ubuntu:latest  nwaliechinyerejessica/cruddur-frontend
 ```
After that I pushed all Images

```sh
docker image push nwaliechinyerejessica/cruddur-backend:latest
docker image push nwaliechinyerejessica/cruddur-frontend:latest
 ```
Below is the outcome of the commands i executed, displaying my docker images
![docker_images](assets/week%201%20docker%20image.png)

I installed Docker on my localmachine 
![docker_localmachine](assets/Screenshot%20(180).png)

I Launched an EC2 instance that has docker installed,
![EC2_instance](assets/week%201%20EC2.jpg)
  
This the docker compose commands I added to the file to run both the containers inside ec2

```yml
version: "3.8"
services:
  backend-flask:
    environment:
      FRONTEND_URL: "http://${ips}:3000"
      BACKEND_URL: "http://${ips}:4567"
    image: nwaliechinyerejessica/cruddur-backend
#    build: ./backend-flask
    ports:
      - "4567:4567"
    volumes:
      - ./backend-flask:$HOME/backend-flask
  frontend-react-js:
    environment:
      REACT_APP_BACKEND_URL: "http://${ips}:4567"
    image: nwaliechinyerejessica/cruddur-frontend
#    build: ./frontend-react-js
    ports:
      - "3000:3000"
    volumes:
      - ./frontend-react-js:$HOME/frontend-react-js

# the name flag is a hack to change the default prepend folder
# name when outputting the image names
networks: 
  internal-network:
    driver: bridge
    name: cruddur
```


  
