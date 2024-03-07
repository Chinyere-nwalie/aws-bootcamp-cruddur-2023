# Week X - Personal Cleanup

- [Overview](#overview)
- [CleanUp for Cruddur part 2](#cleanup-for-cruddur-part-2)
  - [Cognito Alt User](#Cognito-alt-user)
    - [Update Lambda](#update-lambda)
- [Troubleshooting](#troubleshooting)
- [Add Rule to CrdDbRDSSG SG to allow connection from Lambda](#add-rule-to-crddbrdssg-sg-to-allow-connection-from-lambda)
- [Rectified Upload Issues](#rectified-upload-issues)
    - [Allowing Production to upload images](#allowing-production-to-upload-images)
    - [CORS Amendments required to allow avatars to be uploaded to the S3 bucket](#cors-amendments-required-to-allow-avatars-to-be-uploaded-to-the-s3-bucket)
    - [PUT Method not allowed in application](#put-method-not-allowed-in-application)
- [My Experiences](#my-experiences)
- [Proof of cruds working in Production](#proof-of-cruds-working-in-production)
  - [Cruds and Messaging to AltUser working in Prod](#cruds-and-messaging-to-altuser-working-in-prod)
  - [Messaging and Cruds to AltUser working in local](#messaging-and-cruds-to-altuser-working-in-local)
- [All Created CFN Stacks](#all-created-cfn-stacks)

---

## Overview

This week we will be cleaning up all the codes in our application making and ensuring it is stable and clean.

---

## CleanUp for Cruddur part 2

I wrote and provided proof and screenshots of some of these in my Week 11 [Week-11](week11.md) They involved the following;

- Refactoring of codes
- Reimporting TimeDateCodes, profile, and CSS in the app - which I did in > Week 11 [Week-11](week11.md)
- Fixing missing settings in CloudFormation stacks correctly
- Adding a new Cognito user to our Cruddur application to ensure the least privileged access
- Refactor to use JWT decorator in the application
- Implementing replies & Improving error handling; refer to [this commit](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/commit/78a4012625308bcfdcc34600fc2dd491fba2d71b) message

---

## Cognito Alt User

I cleared all Cognito users in my AWS console after creating a CFN CrdSyncRole so it won't glitch and cause users because deleting the old manual RDS means the old Cognito is invalid
![ Cognito Alt](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(192).png)

Sign-up for new users was throwing errors and it was due to no Security groups set for this function
![ Cognito Alt](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(197).png)

### Update Lambda

A new security group was created for the Post Confirmation Lambda (We created a Cognito SG)
![ Cognito Alt](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(198).png)

New Sign up again for **nwaliechinyere**
![ Cognito Alt](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(668).png)

Gmail Confirmation Code
![ Cognito Alt](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(595).png)

I subscribed to AWS SNS-(Simple Notification Service) hence the sender is from Amazon
![ Cognito Alt](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(666).png)

New User Signup for **cloudgeekchie**
![ Cognito Alt](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(216).png)

New User Created
![ Cognito Alt](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(306).png)

I used the following URL to message my altUser in Production: `https://nwaliechinyere.xyz/messages/new/cloudgeekchie`
![ Cognito Alt](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(792).png)

---

## Troubleshooting

Concerning Implementing replies & Improving error handling, when I wrote a reply and clicked on reply, it throws an error
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(288).png)

I handled the error by checking the replies in connection via the local database and there a reply activity uuid but it was showing `uuid` instead on `integer` hence why, then I ran migrations to update **pubilc-activites** for reply_to_activity_uuid migration script
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(290).png)

![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(661).png)

I ran the `./bin/db/migrate` to get an output
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(293).png)

Now there's `reply_to_activity_uuid` and it is showing integer
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(310).png)

Replied all working now!
![Troubleshooting](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(326).png)

---

## Add Rule to `CrdDbRDSSG` SG to allow connection from Lambda

In `CrdDbRDSSG` a new rule was added to allow connectivity as it was previously connected to the default VPC.

![CrdDbRDSSG](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(174).png)

![CrdDbRDSSG](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(199).png)

---

## Rectified Upload Issues

### Allowing Production to upload images

To allow messaging, the following changes need to be made from my experience

- Update the CORS Policy for the avatars bucket to change the `AllowedOrigins` to the production domain
- In the CruddurAvatarUpload Lambda edit `function.rb` to the production domain. Make sure not to have a trailing slash i.e it should be `https://nwaliechinyere.xyz`
- Add the `PUT` method in `/api/profile/update` under `backend-flask/routes/users.py`
- Update the CORS Policy for the avatars bucket to change the `AllowedMethods` as `POST,PUT`

---

### CORS Amendments required to allow avatars to be uploaded to the S3 bucket

![image](CORSfordomain.png)

---

### PUT Method not allowed in application

![image](addundefined.jpg.png)

---

## My Experiences

As the Bootcamp draws near, these are the key things that happened to me in the final week

- Tasks in GitPod and AWS CLI stopped running because `AWS_ENDPOINT_URL` hasn't been set and was causing issues
- The reply function was not working due to me breaking a line of code,  I had to figure out what the issue was by debugging.
- Rollbar stopped working despite working earlier with no errors thrown, I stopped it from working.
- Earlier on in the boot camp I made an error in the seed script and included space when filling in a new username, I had to delete it manually in my database
- Uploading in production was causing CORS issues. In addition to adding permissions to the `nwaliechinyere.xyz` domain, this was resolved by adding the `PUT` method in `/api/profile/update` under `backend-flask/routes/users.py`

---

## Proof of cruds working in Production

### Cruds and Messaging to AltUser working in Prod

![image](newsigninforcloudgeekchie.png)

---

### Messaging and Cruds to AltUser working in local

![image](crudsworkingwithcloudgeekchie.png)

And these are my final commit messages [All done Cruddur working perfectly!](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/commit/100fa2d8ad96afdd8dce36ba7fb210b4a1272831) and [Personal clean up all done](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/commit/1b2b80c7c02945a14b1f3c5f1f40da8a3ce666fd)

---

I published [My Cruddur video ](https://www.youtube.com/playlist?list=PLog3wMUvMmbxNX4Lzwbc2z4QaMmE8E6Q_) on Youtube as proof of completion of all tasks done

---

## All CFN Stacks Created

All stacks were deployed successfully

![image](allcfnstackscomplete.png)

---

 > All these while I was running on an AWS Free tier account that expired on Jan 31st, I had to tear down all the CFN stacks, and all projects to avoid costs

 > Gitpod.yml isn't free to work with, so I was careful spinning up a new environment when working and fixing errors
