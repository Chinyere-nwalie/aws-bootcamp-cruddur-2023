# Week 7 — Solving CORS with a Load Balancer and Custom Domain

Week 7 task was merged  with Week 6. Check my [week6 journal](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/week6.md) for more information. 

## Summary of what I did

- Created services for `backend-flask` and `frontend-react-js` under the `cruddur` cluster on ECS.

A view of the created cluster services in AWS Console

![cluster-cruddur](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(404).png)


- Registered corresponding tasks running healthy.

![cruddur-task](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(405).png)

Security group for our service

![cruddur-task](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(446).png)


-  On CloudWatch log, all events are active, health check are okay with no problems.

![cruddur-task](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(412).png)


- My domain name api health check returns a success, and RDS data of activities can be retrieved.

- Further check the configuration for the frontend task & backend task, the containers are running healthy containers.

A view of the container in my frontend and backend task

![cruddur-task](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(406).png)

![cruddur-task](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(407).png)


-  Now after signing in, I can crud a new post, and I can send messages to a mock user previously inserted into the RDS

![cruddur-task](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(409).png)

---

Next:
> Week 8 [Serverless Image Processing](week8.md)
