# Week 8 — Serverless Image Processing

- [Serverless Image Process CDK](#Serveless-Image-Process-CDK)
- [Serving avatar via CloudFront](#Serving-avatar-via-CloudFront)
- [Implementation User Profile Page](#Implementation-User-Profile-Page)
- [Implementation of Migration Backend Endpoint & Profile Form](#Implementation-of-Migration-Backend-Endpoint-&-Profile-Form)
- [Implementation Avatar Uploading](#Implementation-Avatar-Uploading)
- [Rendering Avatar using Cloudfront](#Rendering-Avatar-using-Cloudfront)
- [Journal Summary](#journal-summary)

---

### Videos for week 8

- [Week 8 Livestream](https://www.youtube.com/watch?v=YiSNlK4bk90)
- [Serverless Image Process CDK](https://www.youtube.com/watch?v=jyUpZP2knBI)
- [Serving Avatars via CloudFront](https://www.youtube.com/watch?v=Hl5XVb7dL6I)
- [Implement Users Profile Page](https://www.youtube.com/watch?v=WdVPx-LLjQ8)
- [Implement Migrations Backend Endpoint and Profile Form](https://www.youtube.com/watch?v=PTafksks528)
- [Implement Avatar Uploading (Part 1)](https://www.youtube.com/watch?v=Bk2tq4pliy8)
- [Fix CORS for API Gateway](https://www.youtube.com/watch?v=eO7bw6_nOIc)
- [Fix CORS Final AWS Lambda Layers](https://www.youtube.com/watch?v=uWhdz5unipA)
- [Render Avatar from CloudFront](https://www.youtube.com/watch?v=xrFo3QLoBp8)

---

## Serverless Image Process CDK

This week we need to use CDK (Cloud Development Kit) to create S3 buckets, Lambda functions, SNS topics, etc., allowing users to upload their avatars to update their profiles.

```sh
cd /workspace/aws-bootcamp-crudder-2023/bin
touch bootstrap prepare
chmod u+x bootstrap prepare
```
Start by manually creating an S3 bucket named `assets.<domain_name>` (e.g., `assets.nwaliechinyere.xyz`), which will be used for serving the processed images in the profile page. In this bucket, create a folder named `banners`, and then upload a `banner.jpg` into the folder.

Secondly, export the following env vars according to your domain name and another S3 bucket (e.g., `nwaliechinyere-cruddur-uploaded-avatars`), which will be created by CDK later for saving the original uploaded avatar images:

```sh
export DOMAIN_NAME=nwaliechinyere.xyz
gp env DOMAIN_NAME=nwaliechinyere.xyz
export UPLOADS_BUCKET_NAME=nwaliechinyere-cruddur-uploaded-avatars
gp env UPLOADS_BUCKET_NAME=nwaliechinyere-cruddur-uploaded-avatars
```

In order to process uploaded images into a specific dimension, a Lambda function will be created by CDK. This function and related packages are specified in the scripts ([repo](https://github.com/chinyere-nwalie/aws-bootcamp-cruddur-2023/tree/week-8/aws/lambdas/process-images)) created by the following commands:

```sh
mkdir -p aws/lambdas/process-images
cd aws/lambdas/process-images
touch index.js s3-image-processing.js test.js  example.json
npm init -y
npm install sharp @aws-sdk/client-s3
```

To check if the created Lambda function works or not, create scripts  ([repo](https://github.com/chinyere-nwalie/aws-bootcamp-cruddur-2023/tree/week-8/bin/avatar)) by the following commands and then upload a profile picture named `data.jpg` inside the created folder `files`:

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

Update `.env.example`  ([reference code](https://github.com/chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/week-8/thumbing-serverless-cdk/.env.example)), and run `cp .env.example .env`. Update `./bin/thumbing-serverless-cdk.ts` and `./lib/thumbing-serverless-cdk-stack.ts` 

In order to let the `sharp` dependency work in Lambda, run the script:

```sh
cd /workspace/aws-bootcamp-cruddur-2023
./bin/avatar/build

cd thumbing-serverless-cdk
```

To create AWS CloudFormation stack `ThumbingServerlessCdkStack`:

- Run `cdk synth` you can debug and observe the generated `cdk.out`
- run `cdk bootstrap "aws://${AWS_ACCOUNT_ID}/${AWS_DEFAULT_REGION}"` (just once)
- Finally run `cdk deploy`, you can observe your what have been created on AWS CloudFormation

Now, after running `./bin/avatar/upload`, at AWS I can observe that the `data.jpg` can be uploaded into the `nwaliechinyere-cruddur-uploaded-avatars` S3 bucket, which triggers `ThumbLambda` function to process the image, and then saves the processed image into the `avatars` folder in the `assets.nwaliechinyere..xyz` S3 bucket.

---
## Serving avatar via CloudFront

Amazon CloudFront is designed to work seamlessly with S3 to serve your S3 content in a faster way. Also, using CloudFront to serve s3 content gives you a lot more flexibility and control. To create a CloudFront distribution, a certificate in the `us-east-1` zone for `*.<your_domain_name>` is required. If you don't have one yet, create one via AWS Certificate Manager, and click "Create records in Route 53" after the certificate is issued.

Create a distribution by:

- Set the Origin domain to point to `assets.<your_domain_name>`
- Choose Origin access control settings (recommended) and create a control setting
- Select Redirect HTTP to HTTPS for the viewer protocol policy
- choose CachingOptimized, CORS-CustomOrigin as the optional Origin request policy, and SimpleCORS as the response headers policy
- Set alternate domain name (CNAME) as `assets.<your_domain_name>`
- Choose the previously created ACM for the Custom SSL certificate.

Remember to copy the created policy to the `assets.<your_domain_name>` bucket by editing its bucket policy.

In order to visit `https://assets.<your_domain_name>/avatars/data.jpg` to see the processed image, we need to create a record via Route 53:

- Set record name as `assets.<your_domain_name>`
- Turn on alias, route traffic to alias to CloudFront distribution
- In my case, you can see my profile at ([link](https://assets.nwaliechinyere.xyz/avatars/data.jpg

Since we don't use versioned file names for a user's avatar, CloudFront Edge caches old avatar. Until the old one expires, you will not immediately see the new avatar after updating the profile. Therefore, we need to [invalidate files](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html) by creating an invalidation:

- Go to the distribution we created
- Under the Invalidations tab, click Create
- add object path `/avatars/*`

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

1 Firstly we had to remodify ‘gitpod.yml file taking out the ‘source’ for each workspace and refactoring the file.

When I tried to compose it wasn’t working

(screenshot 393. png)

I had issues with composing until I remodified my scripts and then ran in my terminal ‘./bin/backend/generate-env’ for the front end too. This will generate the env files for a proper compose-up, and it worked.

In the Frontend I created ‘jsconfig.json’ file. This file is linked to the ‘src’ directory you can reference any frontend file you want to import from here.

```sh
{
  "compilerOptions": {
    "baseUrl": "src"
  },
  "include": ["src"]
}
```

Create a profileform.js file in the folder frontend-react-js/src/components/

Add these code;

```sh
import './ProfileForm.css';
import React from "react";
import process from 'process';
import {getAccessToken} from 'lib/CheckAuth';

export default function ProfileForm(props) {
  const [bio, setBio] = React.useState(0);
  const [displayName, setDisplayName] = React.useState(0);

  React.useEffect(()=>{
    console.log('useEffects',props)
    setBio(props.profile.bio);
    setDisplayName(props.profile.display_name);
  }, [props.profile])

  const onsubmit = async (event) => {
    event.preventDefault();
    try {
      const backend_url = `${process.env.REACT_APP_BACKEND_URL}/api/profile/update`
      await getAccessToken()
      const access_token = localStorage.getItem("access_token")
      const res = await fetch(backend_url, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bio: bio,
          display_name: displayName
        }),
      });
      let data = await res.json();
      if (res.status === 200) {
        setBio(null)
        setDisplayName(null)
        props.setPopped(false)
      } else {
        console.log(res)
      }
    } catch (err) {
      console.log(err);
    }
  }

  const bio_onchange = (event) => {
    setBio(event.target.value);
  }

  const display_name_onchange = (event) => {
    setDisplayName(event.target.value);
  }

  const close = (event)=> {
    if (event.target.classList.contains("profile_popup")) {
      props.setPopped(false)
    }
  }

  if (props.popped === true) {
    return (
      <div className="popup_form_wrap profile_popup" onClick={close}>
        <form 
          className='profile_form popup_form'
          onSubmit={onsubmit}
        >
          <div className="popup_heading">
            <div className="popup_title">Edit Profile</div>
            <div className='submit'>
              <button type='submit'>Save</button>
            </div>
          </div>
          <div className="popup_content">
            <div className="field display_name">
              <label>Display Name</label>
              <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={display_name_onchange} 
              />
            </div>
            <div className="field bio">
              <label>Bio</label>
              <textarea
                placeholder="Bio"
                value={bio}
                onChange={bio_onchange} 
              />
            </div>
          </div>
        </form>
      </div>
    );
  }
}
```

Create the ProfileForm.css under frontend-react-js/src/components/

Add these;

```sh
form.profile_form input[type='text'],
form.profile_form textarea {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
  border-radius: 4px;
  border: none;
  outline: none;
  display: block;
  outline: none;
  resize: none;
  width: 100%;
  padding: 16px;
  border: solid 1px var(--field-border);
  background: var(--field-bg);
  color: #fff;
}

.profile_popup .popup_content {
  padding: 16px;
}

form.profile_form .field.display_name {
  margin-bottom: 24px;
}

form.profile_form label {
  color: rgba(255,255,255,0.8);
  padding-bottom: 4px;
  display: block;
}

form.profile_form textarea {
  height: 140px;
}

form.profile_form input[type='text']:hover,
form.profile_form textarea:focus {
  border: solid 1px var(--field-border-focus)
}

.profile_popup button[type='submit'] {
  font-weight: 800;
  outline: none;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  background: rgba(149,0,255,1);
  color: #fff;
}
```

Add the new component into the Userfeedpage with the amended code

```sh
import './UserFeedPage.css';
import React from "react";
import { useParams } from 'react-router-dom';

import DesktopNavigation  from '../components/DesktopNavigation';
import DesktopSidebar     from '../components/DesktopSidebar';
import ActivityFeed from '../components/ActivityFeed';
import ActivityForm from '../components/ActivityForm';
import {checkAuth, getAccessToken} from '../lib/CheckAuth';
import ProfileHeading from '../components/ProfileHeading';
import ProfileForm from '../components/ProfileForm'

export default function UserFeedPage() {
  const [activities, setActivities] = React.useState([]);
  const [profile, setProfile] = React.useState([]);
  const [popped, setPopped] = React.useState([]);
  const [poppedProfile, setPoppedProfile] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const dataFetchedRef = React.useRef(false);

  const params = useParams();

  const loadData = async () => {
    try {
      const backend_url = `${process.env.REACT_APP_BACKEND_URL}/api/activities/@${params.handle}`
      await getAccessToken()
      const access_token = localStorage.getItem("access_token")
      const res = await fetch(backend_url, {
        headers: {
          Authorization: `Bearer ${access_token}`
        },
        method: "GET"
      });
      let resJson = await res.json();
      if (res.status === 200) {
        setProfile(resJson.profile)
        setActivities(resJson.activities)
      } else {
        console.log(res)
      }
    } catch (err) {
      console.log(err);
    }
  };


  React.useEffect(()=>{
    //prevents double call
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    loadData();
    checkAuth(setUser);
  }, [])

  return (
    <article>
      <DesktopNavigation user={user} active={'profile'} setPopped={setPopped} />
      <div className='content'>
        <ActivityForm popped={popped} setActivities={setActivities} />
        <ProfileForm 
          profile={profile}
          popped={poppedProfile} 
          setPopped={setPoppedProfile} 
        />
        <div className='activity_feed'>
          <ProfileHeading setPopped={setPoppedProfile} profile={profile} />
          <ActivityFeed activities={activities} />
        </div>
      </div>  
      <DesktopSidebar user={user} />
    </article>
  );
}
```

We need to edit the replayform.css Remove the following code from the file

```sh
.popup_form_wrap {
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 48px;
  background: rgba(255,255,255,0.1)
}

.popup_form {
  background: #000;
  box-shadow: 0px 0px 6px rgba(190, 9, 190, 0.6);
  border-radius: 16px;
  width: 600px;
}``sh

and create a file called Popup.css and add this code

```sh
.popup_form_wrap {
  z-index: 100;
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 48px;
  background: rgba(255,255,255,0.1)
}

.popup_form {
  background: #000;
  box-shadow: 0px 0px 6px rgba(190, 9, 190, 0.6);
  border-radius: 16px;
  width: 600px;
}

.popup_form .popup_heading {
  display: flex;
  flex-direction: row;
  border-bottom: solid 1px rgba(255,255,255,0.4);
  padding: 16px;
}

.popup_form .popup_heading .popup_title{
  flex-grow: 1;
  color: rgb(255,255,255);
  font-size: 18px;

}
```

import the popup.css in app.js
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

create the file **update_profile.py** under the folder **backend-flask/services/**
```sh
from lib.db import db

class UpdateProfile:
  def run(cognito_user_id,bio,display_name):
    model = {
      'errors': None,
      'data': None
    }

    if display_name == None or len(display_name) < 1:
      model['errors'] = ['display_name_blank']

    if model['errors']:
      model['data'] = {
        'bio': bio,
        'display_name': display_name
      }
    else:
      handle = UpdateProfile.update_profile(bio,display_name,cognito_user_id)
      data = UpdateProfile.query_users_short(handle)
      model['data'] = data
    return model

  def update_profile(bio,display_name,cognito_user_id):
    if bio == None:    
      bio = ''

    sql = db.template('users','update')
    handle = db.query_commit(sql,{
      'cognito_user_id': cognito_user_id,
      'bio': bio,
      'display_name': display_name
    })
  def query_users_short(handle):
    sql = db.template('users','short')
    data = db.query_object_json(sql,{
      'handle': handle
    })
    return data
```

create a file called **update.sql** inside the folder **backend-flask/db/sql/users**
the query will do an update inside the table users by setting the bio and the display name for the user
```sh
UPDATE public.users 
SET 
  bio = %(bio)s,
  display_name= %(display_name)s
WHERE 
  users.cognito_user_id = %(cognito_user_id)s
RETURNING handle;
```

Since there is no bio field in the DB, You need to create a migration script.
One solution you can use is the SQL alchemy but it will create nested dependecies.

create a file called **migration** under **.bin/generate/**
```sh
#!/usr/bin/env python3
import time
import os
import sys

if len(sys.argv) == 2:
  name = sys.argv[1].lower()
else:
  print("pass a filename: eg. ./bin/generate/migration add_bio_column")
  exit(0)

timestamp = str(time.time()).replace(".","")

filename = f"{timestamp}_{name.replace('_', '')}.py"

klass = name.replace('_', ' ').title().replace(' ','')

file_content = f"""
from lib.db import db

class {klass}Migration:
  def migrate_sql():
    data = \"\"\"
    \"\"\"
    return data
  def rollback_sql():
    data = \"\"\"
    \"\"\"
    return data

  def migrate():
    db.query_commit({klass}Migration.migrate_sql(),{{
    }})
  def rollback():
    db.query_commit({klass}Migration.rollback_sql(),{{
    }})

migration = AddBioColumnMigration
"""
#remove leading and trailing new line
file_content = file_content.lstrip('\n').rstrip('\n')

current_path = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.abspath(os.path.join(current_path, '..', '..','backend-flask','db','migrations',filename))
print(file_path)

with open(file_path, 'w') as f:
  f.write(file_content)
  ```

Note: we can enforce that the name assigned is lowercase by changing the line with this
```sh
name = sys.argv[1].lower()
```

from the **backend-flask/db/** create a folder called **migration**

Once it is done, do the chmod u+x to the folder **.bin/generate/migration** and launch
Inside the folder **backend-flask/db/migration**, the script will generate a file with this  naming **16811528612904313_add_bio_column.py** 

**Note** the name of the file is generated with the timestamp+add_bio_column.py
the codes below highlighted are the ones from the generated file. add the 2 lines in bold need to be added between each block

```sh
from lib.db import db

class AddBioColumnMigration:
  def migrate_sql():
    data = """
```

**ALTER TABLE public.users ADD COLUMN bio text;**

```sh
    """
    return data
  def rollback_sql():
    data = """
```
**ALTER TABLE public.users DROP COLUMN bio;**
```sh
    """
    return data

  def migrate():
    db.query_commit(AddBioColumnMigration.migrate_sql(),{
    })

  def rollback():
    db.query_commit(AddBioColumnMigration.rollback_sql(),{
    })

migration = AddBioColumnMigration
```

Now you need to create another 2 scripts **bin/db/** 
one called **migrate** with the following code
```sh
#!/usr/bin/env python3

import os
import sys
import glob
import re
import time
import importlib

current_path = os.path.dirname(os.path.abspath(__file__))
parent_path = os.path.abspath(os.path.join(current_path, '..', '..','backend-flask'))
sys.path.append(parent_path)
from lib.db import db

def get_last_successful_run():
  sql = """
    SELECT last_successful_run
    FROM public.schema_information
    LIMIT 1
  """
  return int(db.query_value(sql,{},verbose=False))

def set_last_successful_run(value):
  sql = """
  UPDATE schema_information
  SET last_successful_run = %(last_successful_run)s
  WHERE id = 1
  """
  db.query_commit(sql,{'last_successful_run': value})
  return value

last_successful_run = get_last_successful_run()

migrations_path = os.path.abspath(os.path.join(current_path, '..', '..','backend-flask','db','migrations'))
sys.path.append(migrations_path)
migration_files = glob.glob(f"{migrations_path}/*")


last_migration_file = None
for migration_file in migration_files:
  if last_migration_file == None:
    filename = os.path.basename(migration_file)
    module_name = os.path.splitext(filename)[0]
    match = re.match(r'^\d+', filename)
    if match:
      file_time = int(match.group())
      print("====")
      print(last_successful_run, file_time)
      print(last_successful_run > file_time)
      if last_successful_run > file_time:
        last_migration_file = module_name
        mod = importlib.import_module(module_name)
        print('===== rolling back: ',module_name)
        mod.migration.rollback()
        set_last_successful_run(file_time)

print(last_migration_file)

```
Make the file executable by launching chmod u+x for the  **bin/db/migrate** 

one called **rollback** with the following code
```sh
#!/usr/bin/env python3

import os
import sys
import glob
import re
import time
import importlib

current_path = os.path.dirname(os.path.abspath(__file__))
parent_path = os.path.abspath(os.path.join(current_path, '..', '..','backend-flask'))
sys.path.append(parent_path)
from lib.db import db

def get_last_successful_run():
  sql = """
    SELECT last_successful_run
    FROM public.schema_information
    LIMIT 1
  """
  return int(db.query_value(sql,{},verbose=False))

def set_last_successful_run(value):
  sql = """
  UPDATE schema_information
  SET last_successful_run = %(last_successful_run)s
  WHERE id = 1
  """
  db.query_commit(sql,{'last_successful_run': value})
  return value

last_successful_run = get_last_successful_run()

migrations_path = os.path.abspath(os.path.join(current_path, '..', '..','backend-flask','db','migrations'))
sys.path.append(migrations_path)
migration_files = glob.glob(f"{migrations_path}/*")


last_migration_file = None
for migration_file in migration_files:
  if last_migration_file == None:
    filename = os.path.basename(migration_file)
    module_name = os.path.splitext(filename)[0]
    match = re.match(r'^\d+', filename)
    if match:
      file_time = int(match.group())
      print("====")
      print(last_successful_run, file_time)
      print(last_successful_run > file_time)
      if last_successful_run > file_time:
        last_migration_file = module_name
        mod = importlib.import_module(module_name)
        print('===== rolling back: ',module_name)
        mod.migration.rollback()
        set_last_successful_run(file_time)

print(last_migration_file)
```

Make the file executable by launching chmod u+x for the **bin/db/rollback** 

from the **schema.sql** we need to add the new table that creates the schema_information that stores the last successful run and the last migration file. We need to enter to the psql using the script **./bin/db/connect**

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

from the **db.py**, change the following lines
```sh
def query_commit(self,sql,params={}):
self.print_sql('commit with returning',sql,params)
```
```sh
def query_array_json(self,sql,params={}):
self.print_sql('array',sql,params)
```
```sh
def query_object_json(self,sql,params={}):
self.print_sql('json',sql,params)
self.print_params(params)
```
```sh
def query_value(self,sql,params={}):
self.print_sql('value',sql,params)
```

with the following
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

Note: to test the Migrate script and Roll script, you need to update manupulate the table schema information and the user.

this query update the value of last successful run to 0
```sh
 update schema_information set last_successful_run = 0;
 ```

this query remove the column bio from the table users
 ```sh
ALTER TABLE public.users DROP COLUMN bio;
```

use also the following command to see the bahaviour of the column
```sh
\d users
```

Change the **ProfileHeading.js**
Need to set the new field visible on our page
```sh
import './ProfileHeading.css';
import EditProfileButton from '../components/EditProfileButton';


export default function ProfileHeading(props) {
    const backgroundImage = 'url("https://assets.johnbuen.co.uk/banners/banner.jpg")';
    const styles = {
        backgroundImage: backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };
    return (
    <div className='activity_feed_heading profile_heading'>
        <div className='title'>{props.profile.display_name}</div>
        <div className="cruds_count">{props.profile.cruds_count} Cruds</div>
        <div className="banner" style={styles} >
            <div className="avatar">
                <img src="https://assets.johnbuen.co.uk/avatars/data.jpg"></img>
            </div>
        </div>
        <div className="info">
            <div className='id'>
                <div className="display_name">{props.profile.display_name}</div>
                <div className="handle">@{props.profile.handle}</div>
            </div>
            <EditProfileButton setPopped={props.setPopped} />
        </div>
        <div className="bio">{props.profile.bio}</div>
    </div>
    );
}
```

from **profileheading.css** add the following code
```sh
.profile_heading .bio {
  padding: 16px;
  color: rgba (255,255,255,0.7);
}
```

from **show.sql**, change the entire code so the new field will show on the profile page.
```sh
SELECT
    (SELECT COALESCE(row_to_json(object_row),'{}'::json) FROM (
        SELECT
            users.uuid,
            users.handle,
            users.display_name,
            users.bio
            (SELECT count(true)
            FROM public.activities
            WHERE
                activities.user_uuid = users.uuid            
            ) as cruds_count
    ) object_row) as profile,
    (SELECT COALESCE(array_to_json(array_agg(row_to_json(array_row))),'[]'::json) FROM (
        SELECT
            activities.uuid,
            users.display_name,
            users.handle,
            activities.message,
            activities.created_at,
            activities.expires_at
        FROM public.activities
        WHERE
            activities.user_uuid = users.uuid
        ORDER BY activities.created_at DESC
        LIMIT 40
    ) array_row) as activities
FROM public.users
WHERE
    users.handle = %(handle)s
```



## Implementation Avatar Uploading

---

## Rendering Avatar using Cloudfront

---

## Journal Summary

---

