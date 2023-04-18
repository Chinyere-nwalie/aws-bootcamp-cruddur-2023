# Week 6 — Deploying Containers
[ECS Security Best Practices](#ECS-Security-Best-Practices)


- Deploying an ECS Cluster using ECS Service Connect.

- Deploying serverless containers using Fargate for the Backend and Frontend Application.

- Route traffic to the frontend and backend on different subdomains using Application Load Balancer.

- Securing flask container and created several bash utility scripts to easily work with r serverless containers.

- Creating an Elastic Container Repository (ECR)

- Pushing container images to ECR and wrote an ECS Task Definition file for Fargate and Launched our Fargate services via CLI.

- Testing that services individually work and familiarized with Fargate desired capacity.


## ECS Security Best Practices

Choose the right public or private ECR for images

AWS ECR scan images to 'scan on push' using basic or enhanced (inspector + snyk)

AWS fargate cannot run traditional security agents in fargate.

AWS fargate users can run unverified container images.

AWS fargate has no visibility of infrastructure.

AWS fargate containers can run as root and even with elevated priviledges.

