# Cloud Deployment Challenge Notes

## Rules 
### Challenge Rules
- Challenge goal: asses my problem solving skills 
- Fork the challenge repo 
- Use an Infrastructure as Code (IaC) tool to deploy the solution 
- Take at most 2 hours to complete the challenge 
- Send the solution with what you have after 2 hours have elapsed 
- Credentials
  - Credentials will be provided separately (emailed Gretchen)
  - Full access to `us-east-1` and `us-west-2`
  - Credentials expire after 1 hour 
  - You can use the `credentials.sh` script to generate new credentials 

## Non-Functional Requirements
- Should be reusable. 
    - Can be deployed to any AWS account 
    - Can be deployed to any GitHub repository 
- Automatic Updates 
    - It should use github actions to update the website when it changes. 
- Maintainability
    - It should be easy to understand and modify the solution. 
- Automation
    - most steps to configure the solution should be automated via some script.
- Security 
    - The solution should be secure or at least be aware of security concerns and how to address them. 
- Inexpensive
    - The solution should be inexpensive to run. 

### Functional Requirements
- A URL 
    - that can be accessed from the internet 
    - prompts for a username and password
- Username and password 
    - that they can use to authenticate
- Github 
    - Link to the forked repo containing your solution
- README 
    - with a brief explanation of your solution 
    - anything else you’d like us to know


## The Problem Space
- Potential Solutions
    - Static Website Deployment 
        - Upload the `web/index.html` file to an S3 bucket 
        - Serve the files in the bucket via CloudFront 
    - Convert website to a SPA and deploy to CloudFront
        - Protect with username and password using Cognito
        - Deploy the SPA to CloudFront
    - 



## The Solution Space



### Authentication Script
```js
var USERS = {
    protecteddir: [{
        username: 'user',
        password: 'pass',
    }],
};

//Response when auth is not valid.
var response401 = {
    statusCode: 401,
    statusDescription: 'Unauthorized',
    headers: {
        'www-authenticate': {value:'Basic'},
    },
};

var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function btoa(input) {
        input = String(input);
        var bitmap, a, b, c,
            result = "", i = 0,
            rest = input.length % 3; // To determine the final padding

        for (; i < input.length;) {
            if ((a = input.charCodeAt(i++)) > 255
                    || (b = input.charCodeAt(i++)) > 255
                    || (c = input.charCodeAt(i++)) > 255)
                throw new TypeError("Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.");

            bitmap = (a << 16) | (b << 8) | c;
            result += b64.charAt(bitmap >> 18 & 63) + b64.charAt(bitmap >> 12 & 63)
                    + b64.charAt(bitmap >> 6 & 63) + b64.charAt(bitmap & 63);
        }

        // If there's need of padding, replace the last 'A's with equal signs
        return rest ? result.slice(0, rest - 3) + "===".substring(rest) : result;
    }

function handler(event) {
    var request = event.request;
    var headers = request.headers;
    
    var auth = request.headers.authorization && request.headers.authorization.value;

    var project = request.uri.substring(1).split(/\.|\//)[0];
    
    var users = USERS[project];
    
    if(users) {
        if(!auth || !auth.startsWith('Basic ')) {
            return response401;
        }
        
        if(!users.find(function(user) {
            
            // Construct the Basic Auth string
            var authString = 'Basic ' + btoa(user.username + ':' + user.password);
            
            return authString === auth;
        })) {
            return response401;
        }
    }
    return request;
}


```