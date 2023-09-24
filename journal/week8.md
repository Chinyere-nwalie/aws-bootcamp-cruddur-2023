# Week 8 — Serverless Image Processing

- [Serverless Image Process CDK](#Serveless-Image-Process-CDK)
- [Serving avatar via CloudFront](#Serving-avatar-via-CloudFront)
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
## Serving avatar via CloudFront

Amazon CloudFront is designed to work seamlessly with S3 to serve your S3 content in a faster way. Also, using CloudFront to serve s3 content gives you a lot more flexibility and control. 

- To create a CloudFront distribution;
  
  - Make sure your domain name is registered; I am using [nwaliechinyere](https://nwaliechinyere.xyz) and it registered on [porkbun website](https://porkbun.com/)
  - A certificate in the `us-east-1` zone for `*.<your_domain_name>` is required.
  - Domain's name servers registered with Route 53. If you don't have one yet; create one via AWS Certificate Manager, and click "Create records in Route 53" after the certificate is issued.
  
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
   - You can see my profile at ([link](https://assets.nwaliechinyere.xyz/avatars/data.jpg)

- Note: When uploading a new version of an image CloudFront Edge caches old avatars. Until the old one expires, you will not immediately see the new avatar after updating the profile and it will keep displaying the old version of the file. To stop this from happening we need to enable [invalidation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html)

  - In `Cloudfront` select the Cloudfront distribution we created
  - Under the Invalidations tab, click Create
  - Add object path `/avatars/*` and click `Create Invalidation`
  - It will take a minute or so for the change to take effect

This ensures that CloudFront will always serve the latest avatar uploaded by the user.

---

## Implementation User Profile Page

For the backend, update/create the following scripts ([repo](https://github.com/chinyere-nwalie/aws-bootcamp-cruddur-2023/tree/week-8/backend-flask)):

- `backend-flask/db/sql/users/show.sql` to get info about the user
- `backend-flask/db/sql/users/update.sql` to update bio
- `backend-flask/services/user_activities.py`
- `backend-flask/services/update_profile.py`
- `backend-flask/app.py`

For the Frontend, update/create the following scripts ([repo](https://github.com/chinyere-nwalie/aws-bootcamp-cruddur-2023/tree/week-8/frontend-react-js)):

- `frontend-react-js/src/components/ActivityFeed.js`
- `frontend-react-js/src/components/CrudButton.js`
- `frontend-react-js/src/components/DesktopNavigation.js` to change the hardcoded URL into yours
- `frontend-react-js/src/components/EditProfileButton.css`
- `frontend-react-js/src/components/EditProfileButton.js`
- `frontend-react-js/src/components/Popup.css`
- `frontend-react-js/src/components/ProfileAvatar.css`
- `frontend-react-js/src/components/ProfileAvatar.js`
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

- backend-flask/services/update_profile.py
- bin/db/migrate
- bin/db/rollback
- backend-flask/db/sql/users/update.sql: The query will do an update inside the table users by setting the bio and the display name for the user
- bin/generate/migration: Since there is no biofield in the DB, You need to create a migration script.

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


**Note** The name of the file is generated with the timestamp+add_bio_column.py

From the **schema.sql** add a new table that creates the schema_information and stores the last successful run and the last migration file. Connect to psql by running **./bin/db/connect** on your terminal and inputting these codes

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

PS: To test the Migrate script and Roll script, you need to update and manipulate the table schema information and the user.

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

Here's reference to my ([repo]([https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/commit/955f03ca349daa848d71b89f3ce81c7f3110ef46#diff-691fec3bd590373f2413b92b1d83b2a83ddc2852d21326ac2f8b8a2f66946672])


## Implementation Avatar Uploading

---

## Rendering Avatar using Cloudfront

---

## Journal Summary

---

