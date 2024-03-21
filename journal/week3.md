# Week 3 — Decentralized Authentication

- [Decentralized Authentication](#decentralized-authentication)
  - [Amazon Cognito](#amazon-cognito)
    - [User pool](#user-pool)
    - [Cognito Identity pool](#cognito-identity-pool)
- [Integrating Amplify](#integrating-amplify)
  - [Install and Configure Amplify](#install-and-configure-amplify)
  - [Authentication As Code](#authentication-as-code)
  - [Creating a Sign-in Page](#creating-a-sign-in-page)
  - [Updating User Informations](#updating-user-informations)
  - [Creating Sign-Up Page](#creating-sign-up-page)
  - [Creating Confirmation Page](#creating-confirmation-page)
- [Verify JWT Token side to serve authenticated API endpoints in Flask Application](#verify-jwt-token-side-to-serve-authenticated-api-endpoints-in-flask-application)


---

## Decentralized Authentication


Decentralized authentication means using a distributed system to verify the identity of users and grant them access to resources. This method is different from the traditional centralized approach, where one central server or authority controls the authentication process. With AWS Cognito, decentralized authentication means that user identities and credentials are stored in a distributed system rather than in a central database. Each user's identity is verified by multiple systems, including the user's device, AWS Cognito, and other services. This allows for a more secure and scalable authentication process. It also means that if one system goes down, the others can still verify user identities and access. **OAuth** is an example of this; it allows users to log in to apps and services with their social media accounts.


  > I understood the concepts clearly with [this link](https://www.youtube.com/watch?v=9obl7rVgzJw&list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv&index=40)

### Amazon Cognito 

This is a service that is all about usernames and user credentials. It's an authentication that allow users store information locally and quickly in your account, it provides an identity store that scales to millions of users, supports social and enterprise identity. 


Amazon Cognito allows authentication with users then store it locally in your amazon account -> (user directory) and there are two type of amazon cognito which are: Cognito User Pool and Cognito Identity Pool 


### Cognito User pool 

This help to grant access to your Applications; It's your authentication using oath, it is when you're creating web applications and you want to add login and signup you can add different methods of
IPD'S(identity providers). 


### Cognito Identity pool 

This enables access to Amazon services; It allows an application to request for temporary credentials it acts like an access broker. It is also essential to keep confidential your region data when performing a decentralized authentication. [learn more here](https://www.youtube.com/watch?v=tEJIeII66pY&list=PLBfufR7vyJJ7k25byhRXJldB5AiwgNnWv&index=39)

 > It is essential to note user lifecycle management is identities in cloud. When we login, a profile is created. This is to intergrate into an application with custom logins.
  

### Setting up Amazon Cognito User Pool.


1. Go to AWS [Cognito](https://console.aws.amazon.com/cognito/) in the console and checked my region for my service, My region is `us-east-1` 
2. Search for Cognito service and then UserPool tab, click on UserPool -> **Create UserPool**.
3. In the **Authentication providers** section, select **Cognito user pool** 
4. In the **Cognito user pool sign-in options** section, select **Email**. `Click Next`.
5. In the **Security requirements** section, select **No MFA**.
6. In the **User account recovery** section, leave the default settings. `Click Next`.
7. In the **Required attributes** section, select **name** and **preferred_username**. `Click Next`.
8. In the **Email delivery** section, select **Send email with Cognito**. `Click Next`
9. Enter a **User pool name**; I named it as *cruddur-user-pool* 
10. In the **App type** section, select **Public Client** and set a **App client name** which was *cruddur* `Click Next`.
11. I verified all my filled details and then click on **Create User Pool** this was how my userpool was created.

**NOTES:**
* The `name` and `preferred_username` attributes cannot be changed after creation.
* The `Send email with Cognito` option uses Amazon SNS to send emails.
*  `Security requirements with MFA` is recommended but cost more.

AWS Cognito User Pool Created below

![user_pool](assets/cruddur-user-pool%20week%203_LI%20(2).jpg)


## Integrating Amplify

Amplify is a set of tools and services provided by AWS (Amazon Web Services) that simplifies the process of building scalable and secure cloud-powered applications. It offers a range of features including authentication, data storage, analytics, and more, allowing developers to focus on building their applications rather than managing infrastructure.

Amplify works with Amazon Cognito for client-side authentication and enable API calls for custom *login*, *signup*, and *recovery* functionality. 

Below are parts of our Backend and frontend application using Amplify.

| Source File  | Description                                                  |
|-------------:|:--------------------------------------------------------------|
| `app.py`          | Backend configurations for amplify for cognito.         |
| `docker-compose.yml`          | Cognito Environment variables and app local testing.  |
| `HomeFeedPage.js`          | Page responsible for displaying the home feed content.   |
| `ProfileInfo.js`      | Component for displaying user profile information.            |
| `SigninPage.js`            | Page for user sign-in functionality.                     |
| `SignupPage.js`           | Page for user registration.                               |
| `DesktopNavigation.js` | Component to conditionally show links based on login status. |
| `ConfirmationPage.js`     | Page for confirming user accounts and resending codes.    |
| `RecoverPage.js`           | Page for user password recovery.                         |


### Install and Configure Amplify

1. Install Amplify

Run the following command in the frontend-react-js path to install the Amplify client-side library for Amazon Cognito

```sh
npm i aws-amplify --save
```
This will automatically update `package.json` and `package-lock.json` to include the Amplify package.

2. Configure Amplify

In `frontend-react-js/src/App.js`, add the following import:

```js
import { Amplify } from 'aws-amplify';
```

3. Below the import statements, configure Amplify with the necessary environment variables

```js
Amplify.configure({
  AWS_PROJECT_REGION: process.env.REACT_APP_AWS_PROJECT_REGION,
  aws_cognito_region: process.env.REACT_APP_AWS_COGNITO_REGION,
  aws_user_pools_id: process.env.REACT_APP_AWS_USER_POOLS_ID,
  aws_user_pools_web_client_id: process.env.REACT_APP_CLIENT_ID,
  oauth: {},
  Auth: {
    region: process.env.REACT_APP_AWS_PROJECT_REGION,
    userPoolId: process.env.REACT_APP_AWS_USER_POOLS_ID,
    userPoolWebClientId: process.env.REACT_APP_CLIENT_ID,
  },
});
```

4. Ensure that the necessary environment variables are added to the docker-compose.yml file under the frontend section:

```yaml
REACT_APP_AWS_PROJECT_REGION: "${AWS_DEFAULT_REGION}"
REACT_APP_AWS_COGNITO_REGION: "${AWS_DEFAULT_REGION}"
REACT_APP_AWS_USER_POOLS_ID: "${AWS_USER_POOLS_ID}"
REACT_APP_CLIENT_ID: "${CLIENT_ID}"
```

5. Also, set the user pool ID and app client ID as environment variables using the following commands:

```sh
export REACT_APP_AWS_USER_POOLS_ID=<USER_POOLS_ID>
export REACT_APP_CLIENT_ID=<APP_CLIENT_ID>
```

After installation, mine was  `aws-amplify: "^5.0.16` in my frontend-react-js directory's `package.json` file.

I also confirmed email address and my client user being active.

![client_user](assets/active%20user%20week%203_LI.jpg)

### Authentication As Code

Intergrating AWS Cognito to the web app pages require users to be authenticated. <br>
This provides a more secure and seamless user experience. 

- `HomeFeedPage.js` is the page where users will see their feed of posts.
- `ProfileInfo.js` is the page where users can view their personal profile information and settings.

1. Import the `Auth` module from `aws-amplify`. This module provides the functionality to interact with Cognito.

```js
import { Auth } from 'aws-amplify';
```
2. In the `HomeFeedPage.js` file, add the following code to check if the user is authenticated:

```js
const checkAuth = async () => {
  Auth.currentAuthenticatedUser({
    bypassCache: false,
  })
    .then((user) => {
      console.log("user", user);
      return Auth.currentAuthenticatedUser();
    })
    .then((cognito_user) => {
      setUser({
        display_name: cognito_user.attributes.name,
        handle: cognito_user.attributes.preferred_username,
      });
    })
    .catch((err) => console.log(err));
};
```
This code will first check if the user is authenticated by calling the `currentAuthenticatedUser` method. If the user is authenticated, the method will return the user's Cognito user object. The user's name and preferred username will then be set on the `setUser` function.

3. In the `ProfileInfo.js` file, replace the old `signOut` function with the following code:

```js
const signOut = async () => {
  try {
    await Auth.signOut({ global: true });
    window.location.href = "/";
  } catch (error) {
    console.log('error signing out: ', error);
  }
};
```
This will sign the user out of Cognito and redirect them to the home page.


### Creating a Sign-in Page

Follow these steps to create a sign-in page using the `aws-amplify` library.

1. In the `SignInPage.js` file, import the Auth class from the `aws-amplify` package located in the pages directory.
```js
import { Auth } from 'aws-amplify';
```
2. Clear Previous Errors and Prevent Default Form Submission:
```js
setErrors("");  
event.preventDefault(); 
```
This part ensures that any previous error messages are cleared, and it prevents the default behavior of form submission, giving you control over the submission process.

```js
const onsubmit = async (event) => {
    setErrors("");
    event.preventDefault();
    
    // Rest of the code will go here...
};
```

3. Attempt User Sign-In and Handle Success

```js
try {
    // Try user using the provided email and password
    const user = await Auth.signIn(email, password);

    // Store the user's access token securely in the browser
    localStorage.setItem("access_token", user.signInUserSession.accessToken.jwtToken);

    // Redirect the user to the main page after successful sign-in
    window.location.href = "/";
} catch (error) {
    // Errors during sign-in will be handled in the subsequent code block
}

```
4. Handle Errors and Redirect for Unconfirmed Users:

```js
} catch (error) {
    // Log the error to the console
    console.log("Error!", error);
    
    if (error.code === "UserNotConfirmedException") {
        window.location.href = "/confirm";
    }
    
    // Display the error message to the user
    setErrors(error.message);
}
```
In case of an error during sign-in, this part logs the error, checks if it's related to an unconfirmed user, and handles the redirection accordingly. It also displays the error message to the user.

5. Verify your function looking like this after replacing the `onsubmit` function to handle the submission of the sign ins data.

```js
// Handle the submission of sign-in data
const onsubmit = async (event) => {
    setErrors("");  // Clear any previous error messages
    event.preventDefault();  // Prevent the default form submission behavior
    
    try {
        // Attempt to sign in the user using the provided email and password
        const user = await Auth.signIn(email, password); 
        localStorage.setItem("access_token", user.signInUserSession.accessToken.jwtToken);

        // Redirect to the home page upon successful sign-in
        window.location.href = "/";
    } catch (error) {
        console.log("Error!", error);

        // Check if the error is due to an unconfirmed user
        if (error.code === "UserNotConfirmedException") {
            // Redirect to the confirmation page for user confirmation
            window.location.href = "/confirm";
        }
        setErrors(error.message);  // Display the error message to the user
    }
    
    return false;  // Prevent the form from submitting
};
```

6. I added these scripts in my `DesktopNavigation.js` file which helps to check if I am Logged in or not by passing the`user` to `ProfileInfo`.

```js
import './DesktopNavigation.css';
import {ReactComponent as Logo} from './svg/logo.svg';
import DesktopNavigationLink from '../components/DesktopNavigationLink';
import CrudButton from '../components/CrudButton';
import ProfileInfo from '../components/ProfileInfo';

export default function DesktopNavigation(props) {

  let button;
  let profile;
  let notificationsLink;
  let messagesLink;
  let profileLink;
  if (props.user) {
    button = <CrudButton setPopped={props.setPopped} />;
    profile = <ProfileInfo user={props.user} />;
    notificationsLink = <DesktopNavigationLink 
      url="/notifications" 
      name="Notifications" 
      handle="notifications" 
      active={props.active} />;
    messagesLink = <DesktopNavigationLink 
      url="/messages"
      name="Messages"
      handle="messages" 
      active={props.active} />
    profileLink = <DesktopNavigationLink 
      url="/@andrewbrown" 
      name="Profile"
      handle="profile"
      active={props.active} />
  }

  return (
    <nav>
      <Logo className='logo' />
      <DesktopNavigationLink url="/" 
        name="Home"
        handle="home"
        active={props.active} />
      {notificationsLink}
      {messagesLink}
      {profileLink}
      <DesktopNavigationLink url="/#" 
        name="More" 
        handle="more"
        active={props.active} />
      {button}
      {profile}
    </nav>
  );
}
```


### Manual Sign-In Tests

1. Go to the **Sign in** page of the user pool.
2. Enter the user's email address and password.
3. Click on the **Sign in** button.


**Note:** The email address will be used to verify the user's account.

To address the error, follow these steps:

1. Open your terminal or command prompt.
2. Execute the necessary command to reset the password for a user in AWS Cognito.
3. Go to your terminal and paste this

```sh
aws cognito-idp admin-set-user-password --username <username> --password <password> --user-pool-id <userpool_id> --permanent
```
Then <br/>

- Replace `<username>` with the actual username of the user.
- Replace `<password>` with the desired new password.
- Replace `<userpool_id>` with the ID of your user pool.

This is an email notification to reset my password code.

![password_reset](assets/password%20reset%20week%203%20.png)


4. After resetting the password, try to sign in again.

5. Go to the console and see the registered user confirmed.

Here was mine, I created another user called **Andrew Bayko** which is verifired

![image](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/journal/assets/Screenshot%20(417).png)


### Updating User Informations Creating Confirmation Page


1. Go to the User page.
2. Click on `"Edit"` under User attributes.
3. Modify or add information to the Name and Preferred Name fields as required.
4. Save your changes.
5. Log back into the Cruddur application, You will now be able to view the updated name information
6. Re-sign in the main Handler now


This was a sign-in on my Cruddur app with my real name

![username](assets/username%20week%203.png)

---

### Creating Sign-Up Page  

1. Open the `signupPage.js` file.
2. Replace the `cookies` import with the following:

```js
import { Auth } from 'aws-amplify';
```

3. Replace the `onsubmit` event handler with the following code:
```js
const onsubmit = async (event) => {
  event.preventDefault();
  setErrors('');
  try {
    const { user } = await Auth.signUp({
      username: email,
      password: password,
     // To Be Continued
    });
    console.log(user);
    window.location.href = `/confirm?email=${email}`;
  } catch (error) {
    console.log(error);
    setErrors(error.message);
  }
  return false;
};
```
- The first line, `event.preventDefault()`, prevents the default behavior of the submit button, which would be to reload the page.
- The next line, `setErrors('')`, clears the `errors` state variable.

The goal is to keep your users signed in and engaged on the platform once they've logged in.

4. Then the `autoSignIn` Object comes in
```js
      autoSignIn: { 
        // optional - enables auto sign in after user is confirmed
        enabled: true,
      }
```
  - `autoSignIn`: An object that specifies whether the user should be automatically signed in after they are created.

5. Add Cruddur User Attributes using the following code.
```js
  try {
    const { user } = await Auth.signUp({
      attributes: {
        name: name,
        email: email,
        preferred_username: username,
      },
```
  - `attributes`: An object that contains additional attributes about the user, such as their name and email address.

6. The code should look like this.

```js
const onsubmit = async (event) => {
  event.preventDefault();
  setErrors('');
  try {
    const { user } = await Auth.signUp({
      username: email,
      password: password,
      attributes: {
        name: name,
        email: email,
        preferred_username: username,
      },
      autoSignIn: { 
        // optional - enables auto sign in after user is confirmed
        enabled: true,
      }
    });
    console.log(user);
    window.location.href = `/confirm?email=${email}`;
  } catch (error) {
    console.log(error);
    setErrors(error.message);
  }
  return false;
};
```
- If the sign up is successful, the `try` block will log the user object and redirect the user to the confirmation page. The `console.log()` function prints the user object to the console. The `window.location.href` function sets the URL of the current window to the confirmation page.
- If the sign up fails, the `catch` block will log the error and set the `errors` state variable to the error message. The `console.log()` function - prints the error to the console. The `setErrors()` function sets the `errors` state variable to the error message.
5. Save the Sign-Up page and verify it.

Once you have created the page it will now use the AWS Amplify library to sign up users.

---


### Creating Confirmation Page

1. In the `ConfirmationPage.js` file, make sure you have the necessary import statement at the beginning of your code:

```js
import { Auth } from 'aws-amplify';
```

2. Look for the `resend_code` function and add the new code to handle Confirmation.

```js
const resend_code = async (event) => {
  setErrors('');
  try {
     # To Be Continued.
  } catch (err) {
    # To Be Continued
  }
};
```

3. Inside the try block, you will add the code to resend the activation code using AWS Amplify Auth. This code ensures that the activation code is resent to the user's email for confirmation.

```js
  try {
    // Resend the activation code using AWS Amplify Auth
    await Auth.resendSignUp(email);
    console.log('Activation code resent successfully');
    setCodeSent(true);
```
Now, let's handle the specific error cases that might occur during the resend process. 

4. In the catch block, you can add conditional statements to provide meaningful error messages based on the type of error. This helps guide the user and provide relevant feedback.

```js
    catch (err) {
    // Handle errors during resend process
    console.log(err);
    if (err.message === 'Username cannot be empty') {
      setErrors("Please provide an email to resend the Activation Code.");
    } else if (err.message === "Username/client id combination not found.") {
      setErrors("The provided email is either invalid or cannot be found.");
    }
```

5. Locate the existing `onsubmit` function in your code.

This function is responsible for confirming the sign-up process and handling any errors that might occur.

6. Replace the existing onsubmit function with the new code provided below, this updated code ensures smooth handling of confirmation and error feedback.

```js
const onsubmit = async (event) => {
    event.preventDefault();
    setErrors('');
    try {
      // Confirm the sign-up using AWS Amplify Auth
      await Auth.confirmSignUp(email, code);
      // Redirect the user to the homepage upon successful confirmation
      window.location.href = "/";
    } catch (error) {
      // Handle errors during confirmation
      setErrors(error.message);
    }
    return false;
}
```

7. Testing the Confirmation Page; Refresh the Cruddur signin webpage to get the recent changes.
8. Click on `sign up` button where you will input your email address
9. After inputing your details, you will be sent an automatic email of a confirmation code 
10. Go back to the confirmation page, fill the code you received

 I received a cofirmation email to login. 

![verification](assets/verification%20code%20week%203.png)

---

# Verify JWT Token side to serve authenticated API endpoints in Flask Application

Implementing server side verification using JWT, I understood how to use codes for verification, authentication and authorization purposes. Using JWT(JSON Web Token)  It is more straight forward because I would not use another external resource. It was instructed to create a user token, it helps to fetch user data when the user logs in and if user logs out then for that the token was unset. 


We aim to accomplish the JWT verification using Python;

1. Create a file `cognito_jwt_token.py` in the lib directory; this file will contain the code for verifying JWT tokens.

2. Import the following modules; `time`, `requests`, `jose`, `jose.exceptions`, `jose.utils`:

```py
import time
import requests
from jose import jwk, jwt
from jose.exceptions import JOSEError
from jose.utils import base64url_decode
```	

3. Create the following classes `FlaskAWSCognitoError` and `TokenVerifyError` exceptions to raise errors. 

```py
class FlaskAWSCognitoError(Exception):
  pass

class TokenVerifyError(Exception):
  pass
```

The FlaskAWSCognitoError exception is raised for errors that are not related to the JWT token, such as errors that occur when loading the JWK keys. 

4. Create extract_access_token function to extract the access token that takes the request headers as input and returns the access token if it is found. 

```py
def extract_access_token(request_headers):
    access_token = None
    auth_header = request_headers.get("Authorization")
    if auth_header and " " in auth_header:
        _, access_token = auth_header.split()
    return access_token
```
This function is a good example of how to use regular expressions to extract data from strings. The regular expression `" "` in `auth_header` checks if the Authorization header contains a space character. The regular expression `_`, `access_token = auth_header.split()` splits the Authorization header on the space character and returns the second part of the header as the access token.

5. Start creating the `CognitoJwtToken` Class with the following methods and decoders.

```py
class CognitoJwtToken:
    def __init__(self, user_pool_id, user_pool_client_id, region, request_client=None):
    # To be Continued

    def _load_jwk_keys(self):
    # To be Continued

    @staticmethod
    def _extract_headers(token):
    # To be Continued

    def _find_pkey(self, headers):
    # To be Continued

    @staticmethod
    def _verify_signature(token, pkey_data):
    # To be Continued

    @staticmethod
    def _extract_claims(token):
    # To be Continued

    @staticmethod
    def _check_expiration(claims, current_time):
    # To be Continued

    def _check_audience(self, claims):
    # To be Continued

    def verify(self, token, current_time=None):
    # To be Continued
```
* Create `__init__` method to initializes the class with the AWS region, user pool ID, user pool client ID, and a request client.

```py
    def __init__(self, user_pool_id, user_pool_client_id, region, request_client=None):
        self.region = region
        if not self.region:
            raise FlaskAWSCognitoError("No AWS region provided")
        self.user_pool_id = user_pool_id
        self.user_pool_client_id = user_pool_client_id
        self.claims = None
        if not request_client:
            self.request_client = requests.get
        else:
            self.request_client = request_client
        self._load_jwk_keys()
```
* Add `_load_jwk_keys` to loads the JSON Web Key keys from the Cognito user pool

```py
    def _load_jwk_keys(self):
        keys_url = f"https://cognito-idp.{self.region}.amazonaws.com/{self.user_pool_id}/.well-known/jwks.json"
        try:
            response = self.request_client(keys_url)
            self.jwk_keys = response.json()["keys"]
        except requests.exceptions.RequestException as e:
            raise FlaskAWSCognitoError(str(e)) from e
```
* `_extract_headers` which Extracts the headers from the JWT token.

```py
    @staticmethod
    def _extract_headers(token):
        try:
            headers = jwt.get_unverified_headers(token)
            return headers
        except JOSEError as e:
            raise TokenVerifyError(str(e)) from e
```
*  Finds the public key for the JWT token in the JWK keys using `_find_pkey`.

```py
    def _find_pkey(self, headers):
        kid = headers["kid"]
        key_index = -1
        for i in range(len(self.jwk_keys)):
            if kid == self.jwk_keys[i]["kid"]:
                key_index = i
                break
        if key_index == -1:
            raise TokenVerifyError("Public key not found in jwks.json")
        return self.jwk_keys[key_index]
```
* `_verify_signature` - Verifies the signature of the JWT token.

```py
    @staticmethod
    def _verify_signature(token, pkey_data):
        try:
            public_key = jwk.construct(pkey_data)
        except JOSEError as e:
            raise TokenVerifyError(str(e)) from e
        message, encoded_signature = str(token).rsplit(".", 1)
        decoded_signature = base64url_decode(encoded_signature.encode("utf-8"))
        if not public_key.verify(message.encode("utf8"), decoded_signature):
            raise TokenVerifyError("Signature verification failed")

```
The `@staticmethod` decorator is used to create a static method that can be called without needing to instantiate an object of the class. 

* `_extract_claims` - Extracts the claims from the JWT token.

```py
    @staticmethod
    def _extract_claims(token):
        try:
            claims = jwt.get_unverified_claims(token)
            return claims
        except JOSEError as e:
            raise TokenVerifyError(str(e)) from e
```

* Create`_check_expiration` to check if the JWT token has expired.

```py
    @staticmethod
    def _check_expiration(claims, current_time):
        if not current_time:
            current_time = time.time()
        if current_time > claims["exp"]:
            raise TokenVerifyError("Token is expired") 
```

* `_check_audience` - Checks if the JWT token is intended for the specified audience.

```py
    def _check_audience(self, claims):
        audience = claims["aud"] if "aud" in claims else claims["client_id"]
        if audience != self.user_pool_client_id:
            raise TokenVerifyError("Token was not issued for this audience")
```

* Verify the JWT token and returns the claims using `verify`.

```py
    def verify(self, token, current_time=None):
        """ https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.py """
        if not token:
            raise TokenVerifyError("No token provided")

        headers = self._extract_headers(token)
        pkey_data = self._find_pkey(headers)
        self._verify_signature(token, pkey_data)

        claims = self._extract_claims(token)
        self._check_expiration(claims, current_time)
        self._check_audience(claims)

        self.claims = claims 
        return claims
```

The `verify` method is the most important method in the class. It takes a JWT token as input and returns the claims if the token is valid. The method first extracts the headers from the token and then finds the public key for the token in the JWK keys. 

The method then verifies the signature of the token and extracts the claims. Finally, the method checks if the token has expired and if it is intended for the specified audience. If all of the checks pass, the method returns the claims. Otherwise, the method raises an exception.

Here we are, having completed the JWT token. 

```py
import time
import requests
from jose import jwk, jwt
from jose.exceptions import JOSEError
from jose.utils import base64url_decode

class FlaskAWSCognitoError(Exception):
  pass

class TokenVerifyError(Exception):
  pass

def extract_access_token(request_headers):
    access_token = None
    auth_header = request_headers.get("Authorization")
    if auth_header and " " in auth_header:
        _, access_token = auth_header.split()
    return access_token

class CognitoJwtToken:
    def __init__(self, user_pool_id, user_pool_client_id, region, request_client=None):
        self.region = region
        if not self.region:
            raise FlaskAWSCognitoError("No AWS region provided")
        self.user_pool_id = user_pool_id
        self.user_pool_client_id = user_pool_client_id
        self.claims = None
        if not request_client:
            self.request_client = requests.get
        else:
            self.request_client = request_client
        self._load_jwk_keys()

    def _load_jwk_keys(self):
        keys_url = f"https://cognito-idp.{self.region}.amazonaws.com/{self.user_pool_id}/.well-known/jwks.json"
        try:
            response = self.request_client(keys_url)
            self.jwk_keys = response.json()["keys"]
        except requests.exceptions.RequestException as e:
            raise FlaskAWSCognitoError(str(e)) from e

    @staticmethod
    def _extract_headers(token):
        try:
            headers = jwt.get_unverified_headers(token)
            return headers
        except JOSEError as e:
            raise TokenVerifyError(str(e)) from e

    def _find_pkey(self, headers):
        kid = headers["kid"]
        key_index = -1
        for i in range(len(self.jwk_keys)):
            if kid == self.jwk_keys[i]["kid"]:
                key_index = i
                break
        if key_index == -1:
            raise TokenVerifyError("Public key not found in jwks.json")
        return self.jwk_keys[key_index]

    @staticmethod
    def _verify_signature(token, pkey_data):
        try:
            public_key = jwk.construct(pkey_data)
        except JOSEError as e:
            raise TokenVerifyError(str(e)) from e
        message, encoded_signature = str(token).rsplit(".", 1)
        decoded_signature = base64url_decode(encoded_signature.encode("utf-8"))
        if not public_key.verify(message.encode("utf8"), decoded_signature):
            raise TokenVerifyError("Signature verification failed")

    @staticmethod
    def _extract_claims(token):
        try:
            claims = jwt.get_unverified_claims(token)
            return claims
        except JOSEError as e:
            raise TokenVerifyError(str(e)) from e

    @staticmethod
    def _check_expiration(claims, current_time):
        if not current_time:
            current_time = time.time()
        if current_time > claims["exp"]:
            raise TokenVerifyError("Token is expired")

    def _check_audience(self, claims):
        audience = claims["aud"] if "aud" in claims else claims["client_id"]
        if audience != self.user_pool_client_id:
            raise TokenVerifyError("Token was not issued for this audience")

    def verify(self, token, current_time=None):
        """ https://github.com/awslabs/aws-support-tools/blob/master/Cognito/decode-verify-jwt/decode-verify-jwt.py """
        if not token:
            raise TokenVerifyError("No token provided")

        headers = self._extract_headers(token)
        pkey_data = self._find_pkey(headers)
        self._verify_signature(token, pkey_data)

        claims = self._extract_claims(token)
        self._check_expiration(claims, current_time)
        self._check_audience(claims)

        self.claims = claims 
        return claims
```

Although, it has be re-modified at the end of the bootcamp, but you can view it all here in: [My codes](https://github.com/Chinyere-nwalie/aws-bootcamp-cruddur-2023/blob/main/backend-flask/lib/cognito_jwt_token.py)

---

*I also changed the UI of my cruddur App by implementing and writing CSS scripts in my Front-end*

Next:
> Week 4 [Postgres and RDS](week4.md)
