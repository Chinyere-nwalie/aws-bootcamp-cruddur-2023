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
  


  
