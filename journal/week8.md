# Week 8 — Serverless Image Processing

- [Serverless Image Process CDK](#Serveless-Image-Process-CDK)
- [Serving avatar via CloudFront Distribution](#Serving-avatar-via-CloudFront-Distribution)
- [Implementation User Profile Page](#Implementation-User-Profile-Page)
- [Implementation of Migration Backend Endpoint & Profile Form](#Implementation-of-Migration-Backend-Endpoint-&-Profile-Form)
- [Implementation Avatar Uploading](#Implementation-Avatar-Uploading)
- [Rendering Avatar using Cloudfront](#Rendering-Avatar-using-Cloudfront)
- [Journal Summary](#journal-summary)

---

## Serverless Image Process CDK

AWS CDK is an open-source software development framework that enables you to define cloud infrastructure in code and provision it using AWS CloudFormation.

This week, we are using CDK (Cloud Development Kit) to create S3 buckets, Lambda functions, SNS topics, etc. Allowing users to update their profiles with avatars.

First, manually create an S3 bucket named `assets.<domain_name>` (e.g `assets.nwaliechinyere.xyz`), which will be used for serving the processed images on the profile page. In this bucket, create a folder named `banners`, and then upload a `banner.jpg` into the folder.

Secondly, export the following env vars according to your domain name and another S3 bucket (e.g., `nwaliechinyere-cruddur-uploaded-avatars`), which will be created by CDK later for saving the original uploaded avatar images:

```sh
export DOMAIN_NAME=nwaliechinyere.xyz
gp env DOMAIN_NAME=nwaliechinyere.xyz
export UPLOADS_BUCKET_NAME=nwaliechinyere-cruddur-uploaded-avatars
gp env UPLOADS_BUCKET_NAME=nwaliechinyere-cruddur-uploaded-avatars
```

In order to process uploaded images into a specific dimension, a Lambda function will be created by CDK. This function and related packages are specified in the scripts ([code](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/tree/main/aws/lambdas/process-images)) It was created by with these commands:

```sh
mkdir -p aws/lambdas/process-images
cd aws/lambdas/process-images
touch index.js s3-image-processing.js test.js  example.json
npm init -y
npm install sharp @aws-sdk/client-s3
```

To verify if the Lambda function we have created works, create these scripts ([code](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/tree/main/bin/avatar)) by the following commands and then upload a profile picture named `data.jpg` inside the created folder `files`:

```sh
cd /workspace/aws-bootcamp-cruddur-2023
mkdir -p bin/avatar
cd bin/avatar
touch build upload clear
chmod u+x build upload clear
mkdir files
```

Now we can initialize CDK and install related packages:

```sh
cd /workspace/aws-bootcamp-cruddur-2023
mkdir thumbing-serverless-cdk
cd thumbing-serverless-cdk
touch .env.example
npm install aws-cdk -g
cdk init app --language typescript
npm install dotenv
```

Update `.env.example`  ([reference code](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/thumbing-serverless-cdk/.env.example)), and run `cp .env.example .env`. Update `./bin/thumbing-serverless-cdk.ts` and `./lib/thumbing-serverless-cdk-stack.ts` 

In order to let the `sharp` dependency work in Lambda, run the script:

```sh
cd /workspace/aws-bootcamp-cruddur-2023
./bin/avatar/build

cd thumbing-serverless-cdk
```

To create AWS CloudFormation stack `ThumbingServerlessCdkStack`:

- Run `cdk synth`: Generates a CloudFormation template for an AWS CDK app 
- run `cdk bootstrap "aws://${AWS_ACCOUNT_ID}/${AWS_DEFAULT_REGION}"` (just once): this command creates an S3 bucket to store the deployment artifacts, DynamoDB table to store CDK toolkit metadata, and an IAM role to grant CDK permissions to your AWS account.
- Finally run `cdk deploy`: This will package and deploy your AWS resources and you'll observe an AWS CloudFormation has been created.

After running `./bin/avatar/upload`, verify that the `data.jpg` has been uploaded into the `nwaliechinyere-cruddur-uploaded-avatars` S3 bucket, which triggers `ThumbLambda` function to process the image, and then saves the processed image into the `avatars` folder in the `assets.nwaliechinyere..xyz` S3 bucket.

---
## Serving avatar via CloudFront Distribution

Amazon CloudFront is designed to work seamlessly with S3 to serve your S3 content in a faster way. Also, using CloudFront to serve s3 content gives you a lot more flexibility and control. 

- To create a CloudFront distribution;
  
  - Make sure your domain name is registered. I am using [nwaliechinyere](https://nwaliechinyere.xyz) and it is registered on [porkbun website](https://porkbun.com/)
  - A certificate in the `us-east-1` zone for `*.<your_domain_name>` is required.
  - Domain name servers are registered with Route 53. If you don't have one yet; create one via AWS Certificate Manager, and click "Create records in Route 53" after the certificate is issued.
  
- Create a distribution:

| Option | Value |
| ----------- | ----------- |
| Origin domain | **Choose Amazon S3 bucket** `assets.nwaliechinyere.xyz` |
| Name | Set Automatically when you select the S3 bucket |
| Origin access | **Select** Origin access control settings (recommended) |
| Origin access control | `assets.nwaliechinyere.xyz` |
| Create a control setting | Select and choose the following **Sign requests (recommended)**,**Origin type=S3** |
| Viewer protocol policy | Redirect HTTP to HTTPS |
| Cache policy and origin request policy (recommended) | **Selected** |
| Cache policy | CachingOptimized |
| Origin request policy | CORS-CustomOrigin |
| Response headers policy | SimpleCORS |
| Alternate domain name (CNAME) | `assets.nwaliechinyere.xyz` |
| Custom SSL certificate | Certificate created for `nwaliechinyere.xyz` |


Remember to copy the created policy to the `assets.<your_domain_name>` bucket by editing its bucket policy.

- In order to visit `https://assets.<your_domain_name>/avatars/data.jpg` to see the processed image, we need to create a record via Route 53:
   - Go to `Route 53`
   - Click `Create hosted zone`
   - `Domain name` -> Set record name as `assets.<your_domain_name>`
   - `Type` = `Public hosted zone`
   - Click `Create Hosted Zone`
   - Turn on alias, route traffic to alias to CloudFront distribution
   - Here, you can see my [profile](https://assets.nwaliechinyere.xyz/avatars/data.jpg)

- Note: When uploading a new version of an image, CloudFront Edge caches the old avatars. Until the old one expires, you will not immediately see the new avatar after updating the profile and it will keep displaying the old version of the file. To stop this from happening, we need to enable [invalidation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html)

  - In `Cloudfront` select the Cloudfront distribution we created
  - Under the Invalidations tab, click Create
  - Add object path `/*` and click `Create Invalidation`
  - It will take a minute or so for the change to take effect

This ensures that CloudFront will always serve the latest avatar uploaded by the user.

---

## Implementation User Profile Page

For the backend, I updated & created the following scripts;

- `backend-flask/db/sql/users/show.sql` to get info about the user
- `backend-flask/db/sql/users/update.sql` to update bio
- `backend-flask/services/user_activities.py`
- `backend-flask/services/update_profile.py`
- `backend-flask/app.py`

For the Frontend, I updated & created the following scripts;

- `frontend-react-js/src/components/ActivityFeed.js`
- `frontend-react-js/src/components/CrudButton.js`
- `frontend-react-js/src/components/DesktopNavigation.js` to change the hardcoded URL into yours
- `frontend-react-js/src/components/EditProfileButton.css`
- `frontend-react-js/src/components/EditProfileButton.js`
- `frontend-react-js/src/components/Popup.css`
- `frontend-react-js/src/components/ProfileForm.css`
- `frontend-react-js/src/components/ProfileForm.js` to let the user edit their profile page
- `frontend-react-js/src/components/ProfileHeading.css`
- `frontend-react-js/src/components/ProfileHeading.js` to display profile details
- `frontend-react-js/src/components/ProfileInfo.js`
- `frontend-react-js/src/components/ReplyForm.css`
- `frontend-react-js/src/pages/HomeFeedPage.js`
- `frontend-react-js/src/pages/NotificationsFeedPage.js`
- `frontend-react-js/src/pages/UserFeedPage.js` to fetch data
- `frontend-react-js/src/lib/CheckAuth.js`
- `frontend-react-js/src/App.js`
- `frontend-react-js/jsconfig.json`

**Passing User-handle to profile**

This makes the user profile handle unique by removing @andrewbrown as a hardcoded URL.

In DesktopNavigation.js the following is hardcoded

```sh
profileLink = <DesktopNavigationLink 
      url="/@andrewbrown" 
      name="Profile"
      handle="profile"
      active={props.active} />
```

In the Boot-camp forum, it was mentioned that since the user had already passed, we should be able to access it. The above code was replaced with this;

```sh
profileLink = <DesktopNavigationLink 
      url={"/@" + props.user.handle}
      name="Profile"
      handle="profile"
      active={props.active} />
```

This shows the @nwaliechinyere profile when logged in as Chinyere

<src>image!

---

## Implement Migrations Backend Endpoint & Profile Form

Firstly, we re-modify the `gitpod.yml` file taking out the `source` for each workspace and refactoring the file.

When I tried to compose it wasn’t working

(screenshot 393. png)

I had issues with composing up until ran in my terminal `./bin/backend/generate-env` for the backend and `./bin/frontend/generate-env` for the front end too. This will generate the env files for a proper compose-up, and it worked.

In the Frontend I created a `jsconfig.json` file. This file is linked to the `src` directory you can reference any frontend file when you want to import from here.

```sh
{
  "compilerOptions": {
    "baseUrl": "src"
  },
  "include": ["src"]
}
```

For the Frontend, update, edit & create the following scripts 

- `frontend-react-js/src/components/Profileform.js`
- `frontend-react-js/src/components/ProfileForm.css`
- `frontend-react-js/src/components/pages/Userfeedpage.js`
- `frontend-react-js/src/components/replayform.css`


Import the popup.css in app.js
``sh
import './components/Popup.css';
``sh

Now it needs to create an Endpoint, add the following code to **app.py**

```sh
@app.route("/api/profile/update", methods=['POST','OPTIONS'])
@cross_origin()
def data_update_profile():
  bio          = request.json.get('bio',None)
  display_name = request.json.get('display_name',None)
  access_token = extract_access_token(request.headers)
  try:
    claims = cognito_token.verify(access_token)
    cognito_user_id = claims['sub']
    model = UpdateProfile.run(
      cognito_user_id=cognito_user_id,
      bio=bio,
      display_name=display_name
    )
    if model['errors'] is not None:
      return model['errors'], 422
    else:
      return model['data'], 200
  except TokenVerifyError as e:
    # unauthenicatied request
    app.logger.debug(e)
    return {}, 401
```

and add the import update_profile to the **app.py**
```sh
from services.update_profile import *

```

For the Bin & Backend directory create these files;

- `backend-flask/services/update_profile.py`
- `bin/db/migrate`
- `bin/db/rollback`
- `backend-flask/db/sql/users/update.sql`: The query will do an update inside the table users by setting the bio and the display name for the user
- `bin/generate/migration`: Since there is no biofield in the DB, You need to create a migration script.

Note: we can enforce that the name assigned is lowercase by changing the line with this
```sh
name = sys.argv[1].lower()
```

Inside the folder **backend-flask/db/migration** generate a migration file inside the `backend-flask/db/migrations/` directory using the following command:
```bash
./bin/generate/migration add_bio_column
```

After generating the migration file, update the functions as shown below:

```SQL
def migrate_sql():
    data = '''
      ALTER TABLE public.users ADD COLUMN bio text;
    '''
    return data

def rollback_sql():
    data = '''
      ALTER TABLE public.users DROP COLUMN;
    '''
    return data
```


**Note** The name of the file is generated with the `timestamp + add_bio_column.py`

From the **schema.sql** add a new table that creates the schema_information and stores the last successful run and the last migration file. Connect to `psql` by running **./bin/db/connect** on your terminal and inputting these codes

```sh
CREATE TABLE IF NOT EXISTS public.schema_information (
  id integer UNIQUE,
  last_successful_run text
);
```
and launch the following query
```sh
INSERT INTO public.schema_information (id,last_successful_run)
VALUES (1,'0')
ON CONFLICT (id) DO NOTHING;
```

From the **db.py**, the following lines were modified

```sh
def query_commit(self,sql,params={},verbose=True):
  if verbose:
  self.print_sql('commit with returning',sql,params)
```
```sh
def query_array_json(self,sql,params={},verbose=True):
  if verbose:
    self.print_sql('array',sql,params)
```
```sh
def query_object_json(self,sql,params={},verbose=True):
  if verbose:
    self.print_sql('json',sql,params)
    self.print_params(params)
```
```sh
def query_value(self,sql,params={},verbose=True):
  if verbose:
    self.print_sql('value',sql,params)
```

PS: To test the Migrate script and Rollback script, you need to update and manipulate the table schema information and the user.

this query updates the value of the last successful run to 0
```sh
 update schema_information set last_successful_run = 0;
 ```

this query removes the column bio from the table users
 ```sh
ALTER TABLE public.users DROP COLUMN bio;
```

use also the following command to see the behavior of the column
```sh
\d users
```

Here's a reference to my [commit](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/commit/955f03ca349daa848d71b89f3ce81c7f3110ef46#diff-691fec3bd590373f2413b92b1d83b2a83ddc2852d21326ac2f8b8a2f66946672)


## Implementation Avatar Uploading

We require a pre-signed URL that grants temporary access to perform the upload operations on our s3 bucket. This is a secure way to authorize the upload operation without compromising the overall system's security.

- The pre-signed URL is generated by a Lambda function specifically designed for this purpose. To implement this lambda, follow these steps:

  - Create a new folder named `cruddur-upload-avatar & file named function.rb` in the Lambdas folder.
  - Change the current directory to the `cruddur-upload-avatar` folder and initialize a Gemfile by running the command `bundle init`.
  - Update the Gemfile with the required packages and dependencies such as "aws-sdk-s3", "ox" and "jwt", and then install them by executing `bundle install`. View the code below;

```rb
# frozen_string_literal: true
source "https://rubygems.org"
# gem "rails"
gem "aws-sdk-s3"
gem "ox"
gem "jwt"
```
  - After Installing the required packages with `bundle install` Verify that the lambda function works by running `bundle exec ruby function.rb`. This should return a pre-signed URL

img<>
  - Update `function.rb` with this code [function.rb](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/aws/lambdas/cruddur-upload-avatar/function.rb)
  - Update the `Access-Control-Allow-Origin` sections with the URL of the frontend application e.g. `"Access-Control-Allow-Origin": "https://3000-chinyerenwa-awsbootcamp-88ficdh3ade.ws-eu104.gitpod.io"`

  
- To test API Endpoint; Copy the presigned URL and test its endpoint. Start my downloading Thunder Client

  - Installing the Thunder Client extension: This step involves installing the Thunder Client extension, which is a tool that allows you to send HTTP requests and test API endpoints directly within Visual Studio Code.
  - Opening Thunder Client and pasting the pre-signed URL: After installing the extension, you open Thunder Client and paste the pre-signed URL that was generated for the avatar upload. This URL contains the necessary authorization and authentication information.
  - Selecting the binary option and choosing the image file: In the request body, you specify that you will be uploading a binary file (the image file). This ensures that the request is configured correctly to handle binary data.
  - Setting the request method to PUT and sending the request: You set the request method to PUT, indicating to upload the image file to the specified URL. Then, you send the request to initiate the upload process.

Upon successfully completing of these steps, you should receive a "200 OK" response, indicating that the HTTP request was successful.

img<>


#### CruddurUploadAvatar Lambda Console

  - Create a new function in the AWS Lambda called **CruddurUploadAvatar**
  - Select the appropriate runtime as **Ruby 2.7**, for the Lambda function.
  - Click **Create a new role with basic Lambda permissions** as the default execution role.
  - Create the function.
  - Don't forget to set `UPLOADS_BUCKET_NAME` as an environment variable and the Lambda permissions.
  - Create a new policy `PresignedUrlAvatarPolicy` as seen in `aws/policies/s3-upload-avatar-presigned-url-policy.json` [in my code](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/aws/policies/s3-upload-avatar-presigned-url-policy.json), and attach this policy to the role of this Lambda


- The presigned URL Policy

  - Create this policy and assign it to your s3, add the code from the `function.rb` file to the Lambda CruddurUploadAvatarfunction.
  - Navigate to the Lambda function's configuration and access the **Permissions** section.
  - Open the settings of the execution role associated with the Lambda function.
  - Create an inline policy to define the required permissions. Review the policy before creating it. Here;

```JSON
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::<unique>-uploaded-avatars/*"
        }
    ]
  }
```
 - Modify the Lambda runtime handler to from `function.handler` to `function.rb`

### CruddurApiGatewayLambdaAuthorizer

This Lambda Authorizer is responsible for authenticating and authorizing requests before they reach the Lambda function accountable for handling the upload.

  - In your gitpod create this folders `aws/lambdas/lambda-authorizer/`, create this file `index.js` to authorize API Gateway requests. Run the following command to install the required dependencies:
```bash
npm install aws-jwt-verify --save
```
 - Zip the contents of the `aws/lambdas/lambda-authorizer/` directory into a file named `lambda_authorizer.zip` 
 - Create a new Lambda function which is CruddurApiGatewayLambdaAuthorizer in the console using the Node 18 runtime and upload `lambda_authorizer.zip` into the Lambda code source.
 - Add environment variables `USER_POOL_ID` and `CLIENT_ID`


#### API-Gateway-Authorizer
API Gateway acts as a gateway or entry point for incoming requests and enables you to define routes and integrations and handle upload avatar requests.

- To configure the API Gateway, follow these steps:
 
  - Open the API Gateway console and select **HTTP APIs**.
  - Click on **Build**.
  - Choose **Lambda** from the **Add integration** dropdown and select the **CruddurUploadAvatar** lambda function.
  - Enter the API name as `api.<domain_name>`.
  - Click **Next** and create the following two routes:

- `POST /avatars/key_upload`:
  - Authorizer: `CruddurJWTAuthorizer`
  - Lambda integration: `CruddurAvatarUpload`
- `OPTIONS /{proxy+}`:
  - No authorizer
  - Lambda integration: `CruddurAvatarUpload`

#### To configure and attach the authorizer for to the `POST` route:
  
  - Select **Authorization** from the left pane.
  - **Attach authorizers to routes** tab, click on `POST`
  - Go to **Manage authorizers** and click **Create**.
  - Choose **Lambda** as the authorizer type, and select CruddurAvatarUpload as the lambda authorizer from the "Select existing authorizer" dropdown.
  - Turn off **Authorizer caching**.
  - Click **Create** or  **Attach Authorizer**.


- Note: There should be no CORS configuration; The Lambda CORS will take care of it, I faced several issues with this.

 #### Optionally set API Gateway Logs group creation

- I created a log group explicitly for the API gateway to debug the presigned URL process. Follow the instructions below to create one:.
 
 - Open the AWS Management Console.
 - Navigate to the CloudWatch service.
 - In the left navigation pane, choose "Logs".
 - Click on "Create log group".
 - Provide a unique name for the log group I intergrated my already create log which is CruddurApiGatewayLambdaAuthorizer and click on "Create".
 - Navigate to the API Gateway service and click on the gateway you just created
 - In the left navigation pane, choose "Logs/Tracing".
 - Under "Access logging" section, click on "Edit".
 - Choose the previously created CloudWatch Logs and paste the `ARN`
 - Configure the log format and the log level.
 - Click on "Save" to create the API Gateway Logs Group.

View your Cloudwatch logs => Log groups and start troubleshooting.

---

## Rendering Avatar using Cloudfront

- Render and display your Avatar image in your Cruddur application by serving it directly from the CloudFront content delivery network (CDN).

  - I created a new file `frontend-react-js/src/components/ProfileAvatar.js` and `ProfileAvatar.css` in my frontend directory. This file will serve as the component responsible for rendering the Avatars and CSS for  customized styling of the avatar component.
  - Incorporate the `setUser` state within the `CheckAuth` function. This will enable the functionality to set the user state and ensure seamless avatar rendering.
  - Integrate the `ProfileAvatar` component into `frontend-react-js/src/components/ProfileInfo.js` by importing it and updating the corresponding `<ProfileAvatar>` tag. By doing so, you will seamlessly incorporate the avatar into the profile information section of your application.
  - Add the `<ProfileAvatar>` tag to `frontend-react-js/src/components/ProfileHeading.jsx`. This will prominently display the avatar within the profile heading, creating a visually engaging user interface.
  - In the `show.sql` file, modify `users.cognito_user_id` to `cognito_user_uuid`. This adjustment guarantees the proper retrieval and utilization of the `cognito_user_uuid` as part of the avatar rendering process.
  - Re-modify the CSS styles in the `frontend-react-js/src/components/ProfileHeading.css` file such as `.profile_heading`, `.bio`, `.profile-avatar`, `.banner`, `.cruds_count`, `.info`, `.info .id`, `.info .id .display_name`, and `.info .id .handle`.
 
---

## Journal Summary

**Double Check Environment Variables**

- There are some environmental variables that need proper setup and double-checking:

  - In the Lambda: `function.rb` in `CruddurAvatarUpload`: set `Access-Control-Allow-Origin` as your own frontend URL.
  - In the Lambda: `index.js` in `CruddurApiGatewayLambdaAuthorizer`: make sure that the token can be correctly extracted from the authorization header.
  - Environment variables in the two Lambdas were added such as:  `USER_POOL_ID` and `CLIENT_ID` for **CruddurApiGatewayLambdaAuthorizer** and `UPLOADS_BUCKET_NAME`  for **CruddurUploadAvatar**
  - `erb/frontend-react-js.env.erb`: `REACT_APP_API_GATEWAY_ENDPOINT_URL` equals to the Invoke URL shown in the API Gateway.
  - `frontend-react-js/src/components/ProfileForm.js`: `gateway_url` and `backend_url` are correctly set.
---
