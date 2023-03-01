# Week 1 — App Containerization

# I added a dockerfile to my backendfile with this commands
{
FROM python:3.10-slim-buster

WORKDIR /backend-flask

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

ENV FLASK_ENV=development

EXPOSE ${PORT}
CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=4567"] 
}

# I containerized my backend app successfully with this commands
{
cd backend-flask
export FRONTEND_URL="*"
export BACKEND_URL="*"
python3 -m flask run --host=0.0.0.0 --port=4567
cd ..
}

# I Built a backend container and run the it in my Gitpod workspace
 To build = 
 {
 docker build -t  backend-flask ./backend-flask
 }
 To Run =
 {
 docker run --rm -p 4567:4567 -it backend-flask
FRONTEND_URL="*" BACKEND_URL="*" docker run --rm -p 4567:4567 -it backend-flask
export FRONTEND_URL="*"
export BACKEND_URL="*"
docker run --rm -p 4567:4567 -it -e FRONTEND_URL='*' -e BACKEND_URL='*' backend-flask
docker run --rm -p 4567:4567 -it  -e FRONTEND_URL -e BACKEND_URL backend-flask
}

# After running i unset them all
{unset FRONTEND_URL="*"
unset BACKEND_URL="*"}

# I created and deleted the container images
created= {docker ps
docker images}
deleted= {docker image rm backend-flask --force}

# I tested the backend server and made sure the port was work and public
  {curl -X GET http://localhost:4567/api/activities/home -H "Accept: application/json" -H "Content-Type: application/json"}
  
# I ran a npm and created a frontend dockerfile
npm i= {cd frontend-react-js
npm i}

frontend dockerfile= {
FROM node:16.18

ENV PORT=3000

COPY . /frontend-react-js
WORKDIR /frontend-react-js
RUN npm install
EXPOSE ${PORT}
CMD ["npm", "start"]
}

# I Built and ran a frontend container
build= {docker build -t frontend-react-js ./frontend-react-js}
made is run= {docker run -p 3000:3000 -d frontend-react-js}

# I Created a Docker composed file
{
version: "3.8"
services:
  backend-flask:
    environment:
      FRONTEND_URL: "https://3000-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}"
      BACKEND_URL: "https://4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}"
    build: ./backend-flask
    ports:
      - "4567:4567"
    volumes:
      - ./backend-flask:/backend-flask
  frontend-react-js:
    environment:
      REACT_APP_BACKEND_URL: "https://4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}"
    build: ./frontend-react-js
    ports:
      - "3000:3000"
    volumes:
      - ./frontend-react-js:/frontend-react-js

# the name flag is a hack to change the default prepend folder
# name when outputting the image names
networks: 
  internal-network:
    driver: bridge
    name: cruddur
    }

# I Finally added some changes to the frontend notifications.js file, notifications.py file, app.py file and commited all changes made.
  
  


  
