# Week 3 — Decentralized Authentication

- This is to intergrate in intoan aplication with custom login
First stage was to creat a user pool in aws console. I followed instructions with [this link](https://www.youtube.com/watch?v=9obl7rVgzJw&list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv&index=40)
user pools is when you're creating a web applications and you want to add login and signup you can add different methods of IPD'S(identity providers) while federated identity providers is when you want to be able to login like a socila identity from another provider
![user_pool]()
This is an extension of the concept that was sharedby oath and openID. Where by you can store your user at one creation without creating multiple means of profile
Amazon cognito is a service  is all about username, user credentials authentication that allows authentication with users that it stores local quickly in your account,it is an identity broker for a AWS resources for the apllication being built this is divide into two user pool and identity pool. 
user pool is what is your authentication using oath. identity pool allows an application to request for temporary credentials it acts like an access broker. It is also essential to keep confidential your region data
also user lifecycle management is identities in cloud when we login, someone creates a profile
