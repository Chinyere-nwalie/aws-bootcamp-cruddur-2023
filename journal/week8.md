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

This week, we are using CDK (Cloud Development Kit) to create S3 buckets, Lambda functions, SNS topics, etc. This will allow users to update their profile handles with avatars via the Serverless Image Process. We do this by using the [CDK - Cloud Development Kit](https://aws.amazon.com/cdk/) to create a CDK Pipeline.

[CDK Pipelines](https://docs.aws.amazon.com/cdk/v2/guide/cdk_pipeline.html) can automatically build, test, and deploy new versions of our pipeline. CDK Pipelines are self-updating, once we add application stages or stacks, the pipeline automatically reconfigures itself to deploy them. We will use the CDK pipeline implemented in JavaScript, which will perform the following tasks for us.


- **What we will do**

  - Use the sharp package to process an uploaded image and resize it to create a thumbnail
  - Write an AWS Lambda and Deploy the Lambda function
  - Create an s3 bucket that will contain the source image, and be used to process the uploaded image
  - Add an SNS (Simple Notification Service) code to process the PUT function and invoke our Lambda function

To invoke the lambda the following changes need to be made to the application

  - Implement a file upload function in the frontend
  - The PostGres database needs to be updated to include a 'User Bio' field
  - Update SQL scripts to retrieve this information when matched to the users cognito ID

- These npm global packages were installed

  - [aws-cdk](https://www.npmjs.com/package/aws-cdk), [aws-cdk-lib](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html), [dotenv](https://www.npmjs.com/package/dotenv)
  -  [sharp](https://www.npmjs.com/package/sharp), [@aws-sdk/client-s3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
  -  s3 Bucket which we will upload our images to assets with the name `assets.<domainname>`

### BEGIN

Sharp Installation script

To use the sharp package within a lambda function the `node_modules` directory of the deployment package must include binaries for the Linux x64 platform. Once the npm package has been installed we need to run the following npm command.

```sh
cd /workspace/aws-bootcamp-cruddur-2023/thumbing-serverless-cdk
npm install
rm -rf node_modules/sharp
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install --arch=x64 --platform=linux --libc=glibc sharp
```

This process has been automated in the following script. [sharp code](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/bin/avatar/build)

[Sharp Documentation](https://sharp.pixelplumbing.com/install#aws-lambda)



**CDK Pipeline Creation and Installing Global Packages**

Run the following command to install the required packages

```sh
npm i aws-cdk aws-cdk-lib dotenv -g
```

To automate the installation of these packages and our lambda package for our gitpod environment, we can add a task by inserting the following section in our `.gitpod.yml`

```yml
  - name: cdk
    before: |
      npm install aws-cdk -g
      npm install aws-cdk-lib -g
      cd thumbing-serverless-cdk
      npm i      
      cp env.example .env
```

- Created a Folder for Pipeline 

   - We earlier created and stored our Pipeline in a folder called `thumbing-serverless-cdk` in the root of our repository.

```sh
cd /workspace/aws-bootcamp-cruddur-2023
mkdir thumbing-serverless-cdk
```

- **Initialise CDK Pipeline**

   - Navigate to the `thumbing-serverless-cdk` folder and initialise it for typescript.

```sh
cdk init app --language typescript
```

- Prepare and define CDK Pipeline environment
  - Manually created an s3 bucket named `assets.nwaliechinyere.xyz` in my AWS account which will be used for serving the processed images on the profile page. In this bucket, create a folder named `banners`, and then upload a `banner.jpg` into the folder. This will be used to store avatar images, banners for the website
  - Create the following file `.env.example`. This will be used by the lambda application to define the source and output buckets
  - Create a lambda function that will be invoked by our CDK stack in `aws\lambdas\process-images`
  - Add the following code in the `thumbing-serverless-cdk/lib`[thumbing-serverless-cdk-stack.ts](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/thumbing-serverless-cdk/lib/thumbing-serverless-cdk-stack.ts)
  - Another s3 bucket was created it will be used by CDK later for saving the original uploaded avatar images: Do not forget to export the following env vars according to your domain name e.g;

    ```sh
    export DOMAIN_NAME=nwaliechinyere.xyz
    gp env DOMAIN_NAME=nwaliechinyere.xyz
    export UPLOADS_BUCKET_NAME=nwaliechinyere-cruddur-uploaded-avatars
    gp env UPLOADS_BUCKET_NAME=nwaliechinyere-cruddur-uploaded-avatars
   ```

- Create .env.example file
   ```sh
  cd /workspace/aws-bootcamp-cruddur-2023/thumbing-serverless-cdk
  touch .env.example
  ```
  - View my [.env.example](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/thumbing-serverless-cdk/.env.example)


### Create Lambda Function

Create the application in `aws\lambdas\process-images`

```sh
cd /workspace/aws-bootcamp-cruddur-2023/
mkdir -p aws/lambdas/
cd aws/lambdas/process-images
touch index.js s3-image-processing.js test.js
npm init -y
npm install sharp @aws-sdk/client-s3 --save
```

View the code for the [process-images](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/tree/main/aws/lambdas/process-images)

Optionally there is also an [example.json](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/aws/lambdas/process-images/example.json) file, this can be used to test the application using AWS Lambdas test function.

[Read on AWS SDK for more in-depth knowledge](https://github.com/aws/aws-sdk-js-v3#getting-started)


- **Bootstrap environment**

   - [Bootstrapping](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) is the process of provisioning resources for the AWS CDK before you can deploy AWS CDK apps into an AWS environment. (An AWS environment is a combination of an AWS account and Region).
   - Bootstrap the application using the command: The command assumes that you have set the AWS_ACCOUNT_ID and AWS_DEFAULT_REGIONS correctly.

    `cdk bootstrap "aws://$AWS_ACCOUNT_ID/$AWS_DEFAULT_REGION"`

**Note**: Run (just once): the above command, it creates an S3 bucket to store the deployment artifacts, a DynamoDB table to store CDK toolkit metadata, and an IAM role to grant CDK permissions to your AWS account.

-  Once you've bootstrapped, create AWS CloudFormation stack `ThumbingServerlessCdkStack`then run the following:
  - Run `cdk synth`: Generates a CloudFormation template for an AWS CDK app
  - `cdk deploy`: This will package and deploy your AWS resources and you'll observe an AWS CloudFormation has been created.
  - To verify the application has been deployed successfully, run the following command `cdk ls`

- Add the following in `thumbing-serverless-cdk/lib/thumbing-serverless-cdk-stack.ts` for SNS (Simple Notification Service) to process the PUT function and invoke our Lambda function

```tsx
import * as s3 from 'aws-cdk-lib/aws-s3-notifications';

this.createS3NotifyToLambda(folderInput, lambda, bucket);

createS3NotifyToLambda(prefix: string, lambda: lambda.IFunction, bucket: s3.IBucket): void {
  const destination = new s3n.LambdaDestination(lambda);
  bucket.addEventNotification(
    s3.EventType.OBJECT_CREATED_PUT,
    destination,
    { prefix: prefix } // folder to contain the original image
  );
}
```

- Test Deployed Lambda

   - Run the `bin/avatar/upload` Here's the content [code](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/bin/avatar/upload) This uploads a file `data.jpg` to the source directory that the lambda is looking at
   - Verify that the image has been uploaded into the `nwaliechinyere-cruddur-uploaded-avatars` s3 bucket, which triggers the `ThumbLambda` function to process the image, and then saves the processed image into the `avatars` folder in the `assets.nwaliechinyere.xyz` s3 bucket and that it has been resized to 512x512.
 
Remember to always run `cdk synth` to check for errors, if the yaml is returned go ahead and `cdk deploy`

---

**IMAGES**

CDK synth in my Gitpod environment
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(340).png)

CDK Bootstrap in my Gitpod environment
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(332).png)

Cloud formation Thumbing serverless CDK stack
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(456).png)

Cloud formation CDK Toolkit
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(457).png)

The Thumbing serverless CDK stack Lambda Function bucket
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(427).png)

I set Env vars for the bucket in Thumbing serverless CDK stack lambda
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(423).png)

I gave it Cloudwatch log permission for Monitoring & debugging in the Thumbing serverless CDK stack
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(424).png)

s3 Bucket Trigger in Thumbing serverles cdk stack Lambda Function
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(341).png)

I gave the Thumbing serverless CDK stack Lambda Function tags
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(422).png)

s3 Event put notification
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(344).png)

s3  buckets in AWS Console
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(357).png)

I successfully created a folder called Banners and uploaded an image 'banner' in my bucket as the background picture for my cruddur application profile
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(376).png)

Image in my bucket
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(356).png)

---

## Serving avatar via CloudFront Distribution

Amazon CloudFront is designed to work seamlessly with s3 to serve your S3 content in a faster way. Also, using CloudFront to serve s3 content gives you a lot more flexibility and control. 

- To create a CloudFront distribution;
  
  - Make sure your domain name is registered. I am using [nwaliechinyere](https://nwaliechinyere.xyz) and it is registered on [porkbun website](https://porkbun.com/)
  - A certificate in the `us-east-1` zone for `*.<your_domain_name>` is required.
  - Domain name servers are registered with Route 53. If you don't have one yet; create one via AWS Certificate Manager, and click "Create records in Route 53" after the certificate is issued.

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(440).png)
  
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


Remember to create a bucket policy for  `assets.<your_domain_name>` 

- In order to visit `https://assets.<your_domain_name>/avatars/data.jpg` to see the processed image, we need to create a record via Route 53:
   - Go to `Route 53`
   - Click `Create hosted zone`
   - `Domain name` -> Set record name as `assets.<your_domain_name>`
   - `Type` = `Public hosted zone`
   - Click `Create Hosted Zone`
   - Turn on alias, route traffic to alias to CloudFront distribution
   - Here, you can see my [profile](https://assets.nwaliechinyere.xyz/avatars/data.jpg)

- Note: When uploading a new version of an image, CloudFront Edge caches the old avatars. Until the old one expires, you will not immediately see the new avatar after updating the profile and it will keep displaying the old version of the file. To stop this from happening, we need to enable [invalidation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html)

  - In `Cloudfront` select the CloudFront distribution we created
  - Under the Invalidations tab, click Create
  - Add object path `/*` and click `Create Invalidation`
  - It will take a minute or so for the change to take effect

This ensures that CloudFront will always serve the latest avatar uploaded by the user.

A view of the objects in AWS `assets.nwaliechinyere.xyz`

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(374).png)

The CloudFront Invalidations I created 

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(455).png)

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


Content of the uploaded file in my Avatars folder called **data.jpg**

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(453).png)

Content of the uploaded file in my Banners folder called **banner.jpg**

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(454).png)

While working on the user profile, I broke a code in my profileheading.js and everything went blank

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(378).png)

I kept on hitting errors till I opened my frontend-logs debugged and rectified it

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(380).png)

**Passing User-handle to profile**

This makes the user profile handle unique by removing @andrewbrown as a hardcoded URL and putting the specific user handle.

In DesktopNavigation.js the following is hardcoded

```sh
profileLink = <DesktopNavigationLink 
      url="/@andrewbrown" 
      name="Profile"
      handle="profile"
      active={props.active} />
```

In the Boot-camp forum, it was mentioned that since the user had already been passed which is me `nwaliechinyere`, we should be able to access it. The above code was replaced with this;

```sh
profileLink = <DesktopNavigationLink 
      url={"/@" + props.user.handle}
      name="Profile"
      handle="profile"
      active={props.active} />
```
Here in `frontend-react-js/src/components/DesktopNavigation.js` to change the hardcoded URL into yours

Errors are all rectified, my handle is showing as @nwaliechinyere, profile Avatar data.jpg and background banner.jpg are displaying when logged in as Chinyere.

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(389).png)

---

## Implement Migrations Backend Endpoint & Profile Form

Firstly, we re-modify the `gitpod.yml` file taking out the `source` for each workspace and refactoring the file.

When I tried to compose it wasn’t working

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(393).png)

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
`` 

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
After adding 'Display name' and  'Bio' click into our application where the user can add a short intro about themselves here's a picture

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(391).png)

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

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(396).png)

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

And if Table exits and is not going accurately run this;
```sh
drop table schema_information;
DROP TABLE
```
and create a table again

```sh
CREATE TABLE IF NOT EXISTS public.schema_information (
  id integer UNIQUE,
  last_successful_run text
);
```
and launch the following query again
```sh
INSERT INTO public.schema_information (id,last_successful_run)
VALUES (1,'0')
ON CONFLICT (id) DO NOTHING;
```

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(403).png)

From the **db.py**, the following lines were modified adding **verbose=True): AND   if verbose:**

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

Use the following command to see the output of the public users column
```sh
\d users
```

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(400).png)

Here's a reference to my [commit](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/commit/955f03ca349daa848d71b89f3ce81c7f3110ef46#diff-691fec3bd590373f2413b92b1d83b2a83ddc2852d21326ac2f8b8a2f66946672)

Now my profile Bio is set correctly and is displaying

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(459).png)

---

## Implementation Of Avatar Uploading

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

- **To test API Endpoint**; Copy the pre-signed URL and test its endpoint. Start by downloading Thunder Client

  - Installing the Thunder Client extension: This step involves installing the Thunder Client extension, which is a tool that allows you to send HTTP requests and test API endpoints directly within Visual Studio Code.
  - Opening Thunder Client and pasting the pre-signed URL: After installing the extension, you open Thunder Client and paste the pre-signed URL that was generated for the avatar upload. This URL contains the necessary authorization and authentication information.
  - Selecting the binary option and choosing the image file: In the request body, you specify that you will be uploading a binary file (the image file). This ensures that the request is configured correctly to handle binary data.
  - Setting the request method to PUT and sending the request: You set the request method to PUT, indicating to upload the image file to the specified URL. Then, you send the request to initiate the upload process.

After Installing the required packages with `bundle install` and Installing Thuderclient, Verify that the lambda function works by running `bundle exec ruby function.rb`. This should return a pre-signed URL

After successfully completing these steps, you should receive a "200 OK" response, indicating that the HTTP request was successful.

ThunderClient generated Presigned URL Errors for GET
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(464).png)

ThunderClient generated Presigned URL Errors for PUT
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(465).png)

- Update `function.rb` with this code [function.rb](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/aws/lambdas/cruddur-upload-avatar/function.rb)
   - Update the `Access-Control-Allow-Origin` sections with the URL of the frontend application e.g. `"Access-Control-Allow-Origin": "https://3000-chinyerenwa-awsbootcamp-88ficdh3ade.ws-eu104.gitpod.io"`


- **CruddurUploadAvatar Lambda Console**

  - Create a new function in the AWS Lambda called **CruddurUploadAvatar**
  - Select the appropriate runtime as **Ruby 2.7**, for the Lambda function.
  - Click **Create a new role with basic Lambda permissions** as the default execution role.
  - Create the function.
  - Don't forget to set `UPLOADS_BUCKET_NAME` as an environment variable and give the Lambda permissions.
  - Create a new policy `PresignedUrlAvatarPolicy` as seen in `aws/policies/s3-upload-avatar-presigned-url-policy.json` [in my code](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/aws/policies/s3-upload-avatar-presigned-url-policy.json) and attach this policy to the role of this Lambda


- **The PresignedUrlAvatarPolicy**

  - Create this policy and assign it to your s3, add modified codes from the `function.rb` file in gitpod environment to the Lambda CruddurUploadAvatar function.
  - Navigate to the Lambda function's configuration and access the **Permissions** section.
  - Open the settings of the execution role associated with the Lambda function.
  - Modify the Lambda runtime handler from `function.handler` to `function.rb`
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

- **CruddurApiGatewayLambdaAuthorizer**: This Lambda Authorizer is responsible for authenticating and authorizing requests before they reach the Lambda function accountable for handling the upload.

  - In your gitpod environment create this folders `aws/lambdas/lambda-authorizer/`, create this file `index.js` to authorize API Gateway requests. Run the following command to install the required dependencies: ```bash npm install aws-jwt-verify --save```
  - Zip the contents of the `aws/lambdas/lambda-authorizer/` directory into a file named `lambda_authorizer.zip` 
  - Create a new Lambda function which is `CruddurApiGatewayLambdaAuthorizer` in the AWS console using the Node 18 runtime and upload `lambda_authorizer.zip` into the Lambda code source.
  - Add environment variables `USER_POOL_ID` and `CLIENT_ID`


- **API-Gateway-Authorizer**: API Gateway acts as a gateway or entry point for incoming requests and enables you to define routes and integrations and handle upload avatar requests. To configure the API Gateway, follow these steps:
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

- To configure and attach the authorizer to the `POST` route:
  - Select **Authorization** from the left pane.
  - **Attach authorizers to routes** tab, click on `POST`
  - Go to **Manage authorizers** and click **Create**.
  - Choose **Lambda** as the authorizer type, and select CruddurAvatarUpload as the lambda authorizer from the "Select existing authorizer" dropdown.
  - Turn off **Authorizer caching**.
  - Click **Create** or  **Attach Authorizer**.


Note: There should be no CORS configuration; The Lambda CORS will take care of it, I faced several issues with this. See Below for the issues I faced;

When I clicked Inspect on my Application webpage it wasn't showing, nor returning any errors and my application still wasn't working, I cleared CORS as a step to curb this issue
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(496).png)

Cleared all CORS for Apigateway
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(485).png)

The inspect page still doesn't work, I always have to click on the websocket gitpod link in my inspect console to further troubleshoot, Before I cleared CORS, I had this issue for a long time, till I cleared CORS, stopped, and started my environment.
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(506).png)

Now my inspect page is showing but my presigned url keeps showing undefined in my console
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(502).png)


- **Optionally set API Gateway Logs group creation**: I created a log group explicitly for the API gateway to debug the presigned URL process. Follow the instructions below to create one
   - Open the AWS Management Console.
   - Navigate to the CloudWatch service.
   - In the left navigation pane, choose "Logs".
   - Click on "Create log group".
   - Provide a unique name for the log group, I integrated my already created log which is **CruddurApiGatewayLambdaAuthorizer**, and clicked on "Create".
   - Navigate to the API Gateway service and click on the gateway you just created
   - Go through the console and choose "Logging"
   - Inside the "logging" section, click on "Edit"
   - Enable the access logging, then enter the ARN of the cloud watch log group to send your access logs to
   - Then select your desired log format or log level; e.g. YAML
   - Click on "Save" to create the API Gateway Logs Group.

View your Cloudwatch logs => Log groups and start troubleshooting.

CruddurAvatarUpload Lambdas Function
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(460).png)

Presigned URL Policy for CruddurAvatarUpload
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(469).png)

Code Test returned 200 successful
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(473).png)

Apigateway
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(474).png)

Authorization for Avatars in Apigateway
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(477).png)

Cruddur-Api-Gateway-Lambdas-Authorizer Function
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(480).png)

Added Upload Avatar and chose file in the application profile Component
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(490).png)

Integration for Avatars in Apigateway
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(484).png)

Apigatway Custom domain for Cruddur Application
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(491).png)

Properties of the object in nwaliechinyere.xyz bucket
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(493).png)

Set CORS for nwaliechinyere.xyz bucket
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(494).png)

In my networks tab, my presigned URL is showing undefined
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(503).png)

Executed `irb` in my terminal to check the ruby function
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(505).png)

Installing ruby-jwt
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(508).png)

JWT Successfully Installed
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(510).png)

Adding jwt layer in my CruddurAvatarUpload
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(511).png)

Added JWT
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(512).png)

My CruddurApiGatewayLambdaAuthorizer watch logs weren't displaying, I fixed this issue by entirely stopping my environment, logging out from AWS, and starting over again
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(513).png)

ERRORS;

My pre-signed URL wasn't displaying still, I fixed this issue by fixing these lines of [code](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/commit/e07ba5206b426cfe1f8ec45a95ac764f82ae0433)

- In the Function.rb part it means that;
  - `decoded_token = JWT.decode token, nil, false;` This line decodes a JWT using the JWT.decode function, `token:` This means the JWT that you want to decode, `nil:` This means no key will be used to verify the signature, the token will be decoded but not verified for authenticity.
  - `cognito_user_uuid = decoded_token[0]['sub'];` After the token has been decoded, the code extracts the value of the 'sub' claim from the JWT, This `'sub'` means the subject of the JWT, which is often used to identify the user associated with the token.

- In the index.js part it means that;
  - `const jwt = event.headers.authorization;` This line means to retrieve the value of the 'authorization' header from the application HTTP event object. Header contains an authentication token, in JSON Web Token (JWT) format
  - `var token = jwt.substring(7, jwt.length);` This line extracts a portion of the jwt string, starting from the 7th character to the end of the string, By using substring(7), this line effectively removes the "Bearer " prefix, leaving only the actual token.
  - Then `console.log(token);` prints the extracted token to the console for debugging or logging purposes.

Now everything is working fine in my Inspect page network tab
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(518).png)

Now everything is working fine in my Inspect page console tab
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(519).png)

CruddurAvatarUpload watch logs
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(522).png)

CruddurApi Lambdas Authorizer watch logs
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(523).png)

---

## Rendering Avatar using Cloudfront

- Render and display your Avatar image in your Cruddur application by serving it directly from the CloudFront content delivery network (CDN).

  - I created a new file `frontend-react-js/src/components/ProfileAvatar.js` and `ProfileAvatar.css` in my frontend directory. This file will serve as the component responsible for rendering the Avatars and CSS for customized styling of the avatar component.
  - In the `frontend-react-js/src/lib/CheckAuth.js` directory I added  `cognito_user` in the `setUser` to narrow it down to its user. This will enable the functionality to set the user state and ensure seamless avatar rendering.
  - Integrate the `ProfileAvatar` component into `frontend-react-js/src/components/ProfileInfo.js` by importing it and updating the corresponding `<ProfileAvatar>` tag. This will seamlessly incorporate the avatar into the profile information section of the Cruddur application.
  - Add the `<ProfileAvatar>` tag to `frontend-react-js/src/components/ProfileHeading.js`. This will display the avatar within the profile heading, creating a visual user interface.
  - In the `show.sql` file, modify `users.cognito_user_id` to `cognito_user_uuid`. This adjustment guarantees the proper retrieval and utilization of the `cognito_user_uuid` as part of the avatar rendering process.
  - Re-modify the CSS styles in the `frontend-react-js/src/components/ProfileHeading.css` file such as `.profile_heading`, `.bio`, `.profile-avatar`, `.banner`, `.cruds_count`, `.info`, `.info .id`, `.info .id .display_name`, and `.info .id .handle`.
 
Now I have successfully changed my profile Avatar to another picture
![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(524).png)


  - See it all here in my [commit](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/commit/4cb532534fc819f62792648266fade8d01a35d12)
 
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
