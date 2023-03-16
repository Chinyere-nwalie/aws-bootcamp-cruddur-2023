# Week 3 — Decentralized Authentication

- Decentralized Authentication is an extension of the concept that was shared by oath and openID. You can store your user at one creation without creating multiple means of profile. I understood the concepts clearly with [this link](https://www.youtube.com/watch?v=9obl7rVgzJw&list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv&index=40)

Amazon cognito is a service that is all about username, user credentials, authentication that allow users store information locally and quickly in your account, it provides an identity store that scales to millions of users, supports social and enterprise identity federation federated identity providers is when you want to be able to login like a social identity from another provider., This is divided into two. User pool and Identity pool.

- User pool is your authentication using oath, it is when you're creating web applications and you want to add login and signup you can add different methods of IPD'S(identity providers). Identity pool allows an application to request for temporary credentials it acts like an access broker. It is also essential to keep confidential your region data when performing a decentralized authentication. [learn more here](https://www.youtube.com/watch?v=tEJIeII66pY&list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv&index=39)

- It is essential to note user lifecycle management is identities in cloud. When we login, a profile is created. This is to intergrate into an application with custom logins.

# Techinal task
- I created an Amazon Cognito User Pool

![user_pool](assets/cruddur-user-pool%20week%203_LI%20(2).jpg)

I installed and configured Amplify client-side library for Amazon Congnito, I also confirmed email address and my client user being active.

![client_user](assets/active%20user%20week%203_LI.jpg)

After configuring, I gave it an attribute name and it was displaying on my cruddure frontendapp.

![username](assets/username%20week%203.png)

I Implemented API calls to Amazon Cognito for custom login, signup, recovery and forgot password page. I received a cofirmation email to login. 
![verificatio](assets/verification%20code%20week%203.png)

I clicked on forgot page and I got a password reset code.
![password_reset](assets/password%20reset%20week%203%20.png)

