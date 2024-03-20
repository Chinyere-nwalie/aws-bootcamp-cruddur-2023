# Week 1 — App Containerization

- [Containerizing an Application](#containerizing-an-application)
  - [Preparing Flask Before Docker Conternerization](#preparing-flask-before-docker-conternerization)
- [Docker Conternerization ](#docker-conternerization)
  - [Containerized Backend](#containerized-backend)
  - [Containerized Frontend](#containerized-frontend)
  - [Adding OpenAPI endpoint to both the Backend and Frontend page](#adding-openapi-endpoint-to-both-the-backend-and-frontend-page)
- [ Dynamodb and Postgres](#dynamodb-and-postgres)
- [Home Work Challenges](#home-work-challenges)
 
---

## Containerizing an Application

Containerizing an application in simply terms means putting an app into a container which is like a small self-contained package that contains everything the application needs to run; this includes the code, runtime, system tools, and dependencies. The container is like a portable, isolated environment that can be easily deployed and scaled, and we're using docker to containerize our applications because it provides a standardized way to package and deploy applications making it easier to move applications between environments, and to scale them when needed. Using Docker provides isolation between containers, so they are less likely to interfere with each other, it makes it easy to use the same base image for multiple containers, reducing the size and complexity of the environment. 

Fun-fact is I read this book [Increment](https://store.increment.com/products/issue-17-containers) and it talked at large about containers, their history, and Docker too

  > In increment book, it was written that containers are the *Lingua franca* of computing infrastructure

Below are some Docker components<br/>

- Docker Engine -> The core runtime that creates and manages containers.
- Docker Images -> Self-contained snapshots of applications and their dependencies e.g. Frontend.
- Docker Containers -> Runnable instances of Docker images encapsulating the application and its runtime environment.
- Docker Registry -> A centralized repository for storing and sharing Docker images e.g. Dockerhub or ECR.
- Dockerfile -> This is a text file that contains instructions for building Docker images; It specifies the base image, adds dependencies, configures the environment, and defines runtime commands.
- Docker Compose -> simplifies managing multi-container applications. With a YAML file, it defines services, their configurations, and the relationships between them.

Commands for working with Docker<br/>

| Command                  | Description                                               |
|--------------------------|-----------------------------------------------------------|
| `docker build`           | Builds an image from a Dockerfile.                        |
| `docker run`             | Runs a container based on an image.                        |
| `docker stop`            | Stops a running container.                                 |
| `docker ps -a`           | Lists all containers, including stopped ones.              |
| `docker images`          | Lists all available Docker images.                         |
| `docker logs`            | Displays logs of a running container.                      |
| `docker exec`            | Executes a command in container shell.                 |
| `docker-compose arg`      | Starts services with  `up ` and stop with  `down` as **arg**         |


### Preparing Flask Before Docker Conternerization 

Here we ensured that our package manager is updated to the latest version

```sh
sudo apt-get update
```

Then we move forward with the installation of indispensable Python dependencies.

```sh
sudo apt-get install python3-setuptools python3-dev build-essential
```

We included these dependencies in our project and I completed each of them one by one, ensuring a smooth and satisfactory experience. Find more [here](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/backend-flask/requirements.txt)


flask
flask-cors
opentelemetry-api
opentelemetry-sdk 
opentelemetry-exporter-otlp-proto-http 
opentelemetry-instrumentation-flask 
opentelemetry-instrumentation-requests
aws-xray-sdk
watchtower
blinker
rollbar
Flask-AWSCognito
psycopg[binary]
psycopg[pool]
boto3
```

And then install them all with a single command, doing this allows for a more streamlined installation process.

```sh
pip3 install -r requirements.txt
```

We still took these steps to run our application.

```sh
cd /workspace/aws-cloud-project-bootcamp/backend-flask
pip3 install -r requirements.txt
export FRONTEND_URL="*"
export BACKEND_URL="*"
python3 -m flask run --host=0.0.0.0 --port=4567
```

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(110).png)

---

## Docker Conternerization 

1. Go to the root of directory that you want containerize the project
2. Create a file and call it `Dockerfile`
3. Add this code in it; these codes make up the build process and you can make most Dockerfiles with this

- **FROM**: Specifies the base image to use as the starting point.
- **RUN**: Executes a command during the image build process.
- **COPY** or **ADD**: Copies files and directories from the build context into the image.
- **WORKDIR**: Sets the working directory for subsequent instructions.
- **EXPOSE**: Exposes a specific port to allow communication with the container.
- **CMD**: Sets the default command to run when the container starts. 
- **ENV**: Sets environment variables inside the container. 


* More explained Info here;

```sh
# This instruction sets the base image as `python:3.10-slim-buster`, which is a slim version of Python 3.10 based on Debian Buster.
FROM python:3.10-slim-buster

# Sets the working directory inside the container to backend-flask
WORKDIR /backend-flask

# This will copy the requirements.txt file into the image it Copies the `requirements.txt` file from the build context into the container's `backend-flask` directory.
COPY requirements.txt requirements.txt

# This will install all programs/softwares which is required to run our backend, it runs the command `pip3 install -r requirements.txt` inside the container to install the Python dependencies specified in the `requirements.txt` file.
RUN pip3 install -r requirements.txt

# This will copy every folder inside the image which I am trying to make
COPY . .

# Sets the `PYTHONUNBUFFERED` environment variable to `1`, which ensures that Python output is not buffered.
ENV PYTHONUNBUFFERED=1

# This will expose the port specified in our case its ${4567}; Exposes the port to allow interactions with the container.
EXPOSE ${PORT}

# This will run our backend via flask module of python; it sets the default command to run when the container starts. In this case, it runs the flask application using the `python3 -m flask run` command, specifying the host as `0.0.0.0` and the port as `4567`, with the `--debug` option enabled.
CMD [python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=4567]
 ```



### Containerized Backend

1. Build the Dockerfile in the container:

```sh
docker build -t  backend-flask ./backend-flask
```

- `-t backend-flask`: Sets the tag name for the Docker image as "backend-flask".
- `./backend-flask`: Specifies the build context, indicating the location of the Dockerfile and any necessary files or directories required for the build.

2. Run the Dockerfile in the container

```sh
docker run --rm -p 4567:4567 -it -e FRONTEND_URL='*' -e BACKEND_URL='*' backend-flask
```
- `--rm`: Automatically removes the container and its file system after it exits.
- `-p 4567:4567`: Maps port 4567 of the host to port 4567 inside the container, allowing external access to the containerized application.
- `-it`: Provides an interactive terminal for the container.
- `-e FRONTEND_URL='*' -e BACKEND_URL='*'`: Sets environment variables inside the container, with values assigned to `FRONTEND_URL` and `BACKEND_URL`.
- `backend-flask`: Specifies the name of the Docker image to run.

*  I tested the backend server and made sure the port was work and public
 ```sh
 {
 curl -X GET http://localhost:4567/api/activities/home -H "Accept: application/json" -H "Content-Type: application/json"
 }
 ```


### Containerized Frontend

To set up the frontend, we need first to install the Node Package Manager.


```sh
cd frontend-react-js
npm i
```

Once the dependencies are installed, you can run the ReactJS app on port
```sh
npm start -- --port=3000
```

By integrating both the backend and frontend processes, we can now get access to the app. Docker allows us to specify all tasks for each container in a single file, making them implicit.


Create Dockerfile for frontend

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

1. Build the Frontend container

```sh
docker build -t frontend-react-js ./frontend-react-js
```
- `-t frontend-react-js`: Sets the tag name for the Docker image as "frontend-react-js".
- `./frontend-react-js`: Denotes the build context directory containing the Dockerfile and associated resources.  

2. Run Frontend container

```sh
docker run --rm -p 3000:3000 -d frontend-react-js
```

- `--rm`: Automatically removes the container and its file system after it exits.
- `-p 3000:3000`: Maps port 3000 of the host to port 3000 inside the container, enabling access to the containerized application from the host machine.
- `-d`: Runs the container in detached mode, allowing it to run in the background without blocking the terminal.
- `frontend-react-js`: Refers to the name of the Docker image to run.

Now run docker compose up and unlock the ports (3000, 4567); open the link of 3000 in the browser, sign up and sign in as a new user

The containers

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(119).png)

  > Docker Compose is a tool for defining and running multi-container as services by designing a single YAML file and with a single command, you create and start all the services from your configuration.Compose will allows us to manage these containers in one go enabling seamless interconnection.

---

### Adding OpenAPI endpoint to both the Backend and Frontend page

We made use of **OPENAPI** OpenAPI is a specification that provides a machine-readable format for defining and documenting RESTful APIs. At its core, OpenAPI provides a comprehensive and user-friendly framework to help innovators visualize and share their vision.

We defined the path `/api/activities/notifications`, which represents the endpoint for retrieving activity notifications. The `get` keyword indicates that this path supports the HTTP GET method.


For the backend, I modified the following files:

- `backend-flask/openapi-3.0.yml`: to add `/api/activities/notifications` in `paths` making ` /api/activities/home` as reference
- `backend-flask/app.py`: add the route for `/api/activities/notifications` and define the function for `data_notifications`, which uses the class `NotificationsActivities` imported from `services.notifications_activities`
- `backend-flask/services/notifications_activities.py`: define the class `NotificationsActivities` we constantly made use of `home_activities.py` as reference

Here's the notification code

```sh
/api/activities/notifications:
    get:
      description: 'Return a feed of activity for all of those that I interact with'
      tags:
        - activities
      parameters: []
      responses:
        '200':
          description: Return an array of activities
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Activity'
```


- description -> This field provides a brief description of the endpoint's purpose, which in this case is to return a feed of activity for all the users that the current user follows.
- tags -> Tags are used to categorize endpoints. In this case, the endpoint is tagged with `activities`.
- parameters -> This section specifies any parameters required by the endpoint. In the given code snippet, there are no parameters defined ([] empty array).
- responses -> Here, we define the responses that the endpoint can return. In this case, there is a single response with the status code `200` (indicating a successful response).
  - description -> This field provides a brief description of the response, stating that it returns an array of activities.
  - content -> Describes the content type of the response. In this case, it is `application/json`, indicating that the response will be in JSON format.
    - schema -> Defines the structure of the response data. Here, it specifies that the response is an array (`type: array`) of items that follow the schema defined in `#/components/schemas/Activity`.

  > We also defined Endpoint in our Flask App in this task


For the frontend, I created and modified the following<br/>

- Create a `frontend-react-js/src/pages/NotificationsFeedPage.js` and paste the code below

```js
import './NotificationsFeedPage.css';
import React from "react";

import DesktopNavigation  from '../components/DesktopNavigation';
import DesktopSidebar     from '../components/DesktopSidebar';
import ActivityFeed from '../components/ActivityFeed';
import ActivityForm from '../components/ActivityForm';
import ReplyForm from '../components/ReplyForm';

// [TODO] Authenication
import Cookies from 'js-cookie'

export default function NotificationsFeedPage() {
  const [activities, setActivities] = React.useState([]);
  const [popped, setPopped] = React.useState(false);
  const [poppedReply, setPoppedReply] = React.useState(false);
  const [replyActivity, setReplyActivity] = React.useState({});
  const [user, setUser] = React.useState(null);
  const dataFetchedRef = React.useRef(false);

  const loadData = async () => {
    try {
      const backend_url = `${process.env.REACT_APP_BACKEND_URL}/api/activities/notifications`
      const res = await fetch(backend_url, {
        method: "GET"
      });
      let resJson = await res.json();
      if (res.status === 200) {
        setActivities(resJson)
      } else {
        console.log(res)
      }
    } catch (err) {
      console.log(err);
    }
  };

  const checkAuth = async () => {
    console.log('checkAuth')
    // [TODO] Authenication
    if (Cookies.get('user.logged_in')) {
      setUser({
        display_name: Cookies.get('user.name'),
        handle: Cookies.get('user.username')
      })
    }
  };

  React.useEffect(()=>{
    //prevents double call
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    loadData();
    checkAuth();
  }, [])

  return (
    <article>
      <DesktopNavigation user={user} active={'notifications'} setPopped={setPopped} />
      <div className='content'>
        <ActivityForm  
          popped={popped}
          setPopped={setPopped} 
          setActivities={setActivities} 
        />
        <ReplyForm 
          activity={replyActivity} 
          popped={poppedReply} 
          setPopped={setPoppedReply} 
          setActivities={setActivities} 
          activities={activities} 
        />
        <div className='activity_feed'>
          <div className='activity_feed_heading'>
            <div className='title'>Notifications</div>
          </div>
          <ActivityFeed 
            setReplyActivity={setReplyActivity} 
            setPopped={setPoppedReply} 
            activities={activities} 
          />
        </div>
      </div>
      <DesktopSidebar user={user} />
    </article>
  );
}
```

- Create a `NotificationsFeedPage.css` in the same directory, this file is for styling
- In the `App.js` file, include the following import statement

```js
import NotificationsFeedPage from './pages/NotificationsFeedPage';
```

- Below in `app.py` where the endpoints are declared add the following
```jsx
{
  path: "/notifications",
  element: <NotificationsFeedPage />
},
```

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(117).png)

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(118).png)


  > NB: When the server refuses to load, I use the command {gp stop} in my terminal to stop the workspace and start again and it worked successfully.

---

## Dynamodb and Postgres

For more accurate data, We will make use of DynamoDB to enable seamless message sending within our platform and efficiently store the associated data.

To run the dynamodb via container I added these commands in the docker-compose file
 
```yml
dynamodb-local:
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
More explanations;

- `dynamodb-local` is the name given to this specific section.
- `user: root` specifies the user for running the DynamoDB Local container.
- `command: "-jar DynamoDBLocal.jar -sharedDb -dbPath ./data"` provides the command to be executed inside the container, launching DynamoDB Local with specific options. This includes using a shared database (`-sharedDb`) and specifying the database path (`-dbPath`) as "./data".
- `image: "amazon/dynamodb-local:latest"` refers to the Docker image used for the DynamoDB Local container. In this case, it uses the latest version of the "amazon/dynamodb-local" image.
- `container_name: dynamodb-local` assigns the name "dynamodb-local" to the container.
- `ports: - "8000:8000"` maps the container's port 8000 to the host machine's port 8000, allowing access to the DynamoDB Local service.
- `volumes: - "./docker/dynamodb:/home/dynamodblocal/data"` creates a volume mapping between the local directory "./docker/dynamodb" and the container's "/home/dynamodblocal/data" directory. This ensures that data persists between container restarts.
- `working_dir: /home/dynamodblocal` sets the working directory inside the container to "/home/dynamodblocal".

---

To run the Postgress via container, I included PostgreSQL scripts in the `docker-compose.yml` file. 

```sh
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

More explanations;

- `db` section defines a service named "db" in the Docker Compose file.
- `image: postgres:13-alpine` specifies the Docker image to be used, which is the PostgreSQL version 13 with the Alpine Linux distribution.
- `restart: always` ensures that the container automatically restarts if it stops unexpectedly.
- `environment` sets the environment variables required for the PostgreSQL container. In this case:
  - `POSTGRES_USER=postgres` specifies the username for the PostgreSQL database as "postgres".
  - `POSTGRES_PASSWORD=password` sets the password for the "postgres" user.
- `ports` maps the container's port 5432 to the host machine's port 5432, allowing access to the PostgreSQL database service.
- `volumes` creates a named volume named "db" and mounts it to the "/var/lib/postgresql/data" directory inside the container. This ensures that the database data persists even if the container is restarted or recreated.

  > This [link](https://stackoverflow.com/questions/67533058/persist-local-dynamodb-data-in-volumes-lack-permission-unable-to-open-databa) was insightful and helpful executing this task

---

## Home Work Challenges

These were assignments I accomplised<br/>

1. Research best practices of Dockerfiles
2. Pushed and tag a images to DockerHub
3. Launched an EC2 instance that has docker installed
4. Installed Docker app on your localmachine `{Dell-Laptop}`


### (1) Security Best Practices for Dockerfiles

- Image Integrity: Use trusted and verified container images from reputable sources. Regularly update and patch these images to address any known vulnerabilities.
- Container Isolation: Isolate containers from each other and the host system using appropriate containerization technologies. 
- Secure Configuration: Follow secure configuration practices Inc. minimizing the number of running processes disabling unnecessary services.
- Vulnerability Scanning: Regularly scan container images and the underlying host system for known vulnerabilities.


| Dockerfiles                            | Docker Compose                          |
| -------------------------------------- | --------------------------------------- |
| Use official base images               | Limit exposed ports                      |
| Update regularly                       | Restrict container privileges            |
| Minimize image layers                  | Implement resource limits                |
| Remove unnecessary dependencies        | Use secure environment variables        |
| Run containers with non-root users      | Separate sensitive data                  |


### (2) Pushed and tag a images to DockerHub

I pushed the docker images from my Gitpod CLI to my docker hub<br/>

Using the following commands, I firstly create an access token, then I login, tag and push the images of my Front and backend  to my public repo at DockerHub ![docker Frontend](https://hub.docker.com/repository/docker/nwaliechinyerejessica/cruddur-frontend/general) and ![docker Backend](https://hub.docker.com/repository/docker/nwaliechinyerejessica/cruddur-backend/general)


I achieved this by firstly creating an access token, then i login to docker in my CLI<br/>

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


### (3) Launched an EC2 instance that has docker installed

I Launched an EC2 instance that has docker installed

![EC2_instance](assets/week%201%20EC2.jpg)
  
This the docker compose commands I added to the file to run both the containers inside ec2<br/>

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


### (4) Installed Docker app on my  localmachine 

I installed Docker on my localmachine 

![docker_localmachine](assets/Screenshot%20(180).png)

---
  
Next:
> Week 2 [Distributed Tracing](week2.md)
