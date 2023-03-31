# Week 3 — Decentralized Authentication

- Decentralized Authentication is an extension of the concept that was shared by oath and openID. You can store your user at one creation without creating multiple means of profile. I understood the concepts clearly with [this link](https://www.youtube.com/watch?v=9obl7rVgzJw&list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv&index=40)

Amazon cognito is a service that is all about username, user credentials, authentication that allow users store information locally and quickly in your account, it provides an identity store that scales to millions of users, supports social and enterprise identity federation federated identity providers is when you want to be able to login like a social identity from another provider., This is divided into two. User pool and Identity pool.

- User pool is your authentication using oath, it is when you're creating web applications and you want to add login and signup you can add different methods of IPD'S(identity providers). Identity pool allows an application to request for temporary credentials it acts like an access broker. It is also essential to keep confidential your region data when performing a decentralized authentication. [learn more here](https://www.youtube.com/watch?v=tEJIeII66pY&list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv&index=39)

- It is essential to note user lifecycle management is identities in cloud. When we login, a profile is created. This is to intergrate into an application with custom logins.

# Techinal task
- I created an Amazon Cognito User Pool

![user_pool](assets/cruddur-user-pool%20week%203_LI%20(2).jpg)

- How I set up UserPool in AWS Cognito

I Logged in my your AWS Console and Checked my region for my service. My region is `us-east-1` 

Search for Cognito service and then UserPool tab, click on UserPool -> Create UserPool.

It displayed  **Authentication providers** page I Inputed my Username and Email for Cognito user pool sign-in options -> click Next and kept my Password Policy as Cognito Default.

I didn't select Multi-factor authentication, In User account recovery -> checkbox --Email only--and Under Required attributes I selected -Name- and --preferred username--

I choose --Send email with Cognito-- for first time after that, I was asked to give my User Pool Name , I named it as --cruddur-user-pool--  and under Initial app client I kept it as --Public client-- and entered my app client name --(eg: cruddur)--

I verified all my filled details and then click on --Create User Pool-- this was how my userpool was created.

I installed and configured Amplify client-side library for Amazon Congnito as it is development platform and provides you set of pre-built UI components and Libraries.
```
npm i aws-amplify --save
```
- To Configure Amplify
I added this code in `app.js` of frontend-react-js directory.
```js
import { Amplify } from 'aws-amplify';

Amplify.configure({
  "AWS_PROJECT_REGION": process.env.REACT_AWS_PROJECT_REGION,
  "aws_cognito_identity_pool_id": process.env.REACT_APP_AWS_COGNITO_IDENTITY_POOL_ID,
  "aws_cognito_region": process.env.REACT_APP_AWS_COGNITO_REGION,
  "aws_user_pools_id": process.env.REACT_APP_AWS_USER_POOLS_ID,
  "aws_user_pools_web_client_id": process.env.REACT_APP_CLIENT_ID,
  "oauth": {},
  Auth: {
    // We are not using an Identity Pool
    // identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID, // REQUIRED - Amazon Cognito Identity Pool ID
    region: process.env.REACT_AWS_PROJECT_REGION,           // REQUIRED - Amazon Cognito Region
    userPoolId: process.env.REACT_APP_AWS_USER_POOLS_ID,         // OPTIONAL - Amazon Cognito User Pool ID
    userPoolWebClientId: process.env.REACT_APP_AWS_USER_POOLS_WEB_CLIENT_ID,   // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
  }
});
```
After installation, mine was  `"aws-amplify": "^5.0.16",` in my frontend-react-js directory's `package.json` file.

I also confirmed email address and my client user being active.

![client_user](assets/active%20user%20week%203_LI.jpg)

After configuring, I gave it an attribute name and it was displaying on my cruddure frontendapp.

![username](assets/username%20week%203.png)

I Implemented API calls to Amazon Cognito for custom login, signup, recovery and forgot password page. I received a cofirmation email to login. 
![verificatio](assets/verification%20code%20week%203.png)

I clicked on forgot page and I got a password reset code.
![password_reset](assets/password%20reset%20week%203%20.png)

