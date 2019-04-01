# RRATFR Manager
[![Build Status](https://travis-ci.org/RAK3RMAN/rratfr-manager.svg?branch=master)](https://travis-ci.org/RAK3RMAN/rratfr-manager)

RRATFR Race Day Manager Platform

### Basic Structure
This platform is built for the specific use on race day of the Rock River Anything That Floats Race. Running on NodeJS, this platform provides a webpage with functions for listing rafts, displaying status of raft, and timing with an externally accessible api for timing results.

### Application Map
```
--app.js # Primary NodeJS file
--routes # Routes for views
  --mainRoutes.js
--views # Components of webpage, HTML
  --pages
    --home.ejs # Home Page
    --error.ejs # Error Page
--config # Folder where configurations are set
  --exitOpt.js # Exit options when running in testing environment
  --sysConfig.json # Appears upon system configuration within application
--static # Place static files to be accessed by webpage here
--package.json # NPM 
--package-lock.json
--start.sh
--LICENSE
--README.md
--.travis.yml
```

## Install and Setup
- Clone the repository from github.com
```
git clone https://github.com/RAK3RMAN/rratfr-manager.git
```
- Setup RRATFR Manager
    - Enter the rratfr-manager folder
        - `cd rratfr-manager`
    - Install all required packages with root-level access (if needed)
        - `sudo npm install`    
    - Start default application using npm
        - `npm start`
    - If you want a different broadcast port or mongodb url, you can configure these values by proceeding with the:
        - Hardcode option:
            - Enter the `sysConfig.json` file
                - `sudo nano rratfr-manager/config/sysConfig.json`
            - Edit the `console_port` or `mongodb_url` parameters to your desired configuration
    - If any errors occur, please read the logs and attempt to resolve. If resolution cannot be achieved, post in the issues under this project. 
- Access web application through `localhost:3000` to ensure application is active
- Change mongodb_url if needed (steps given above)
- Navigate to the signup page `localhost:3000/signup` and enter username and password
- You should then be directed to the secret dashboard page, the signup was unsuccessful if you were redirected back to the signup page
- By clicking the logout button or directing to `localhost:3000/logout`, you can remove your credentials from the session
- Then you can login regularly through the login page at `localhost:3000/login`
