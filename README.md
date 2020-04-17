# RRATFR Manager

![](./static/img/demo/landingpage.png)

## Rock River Anything That Floats Race | Race Manager
[![Build Status](https://travis-ci.org/RAK3RMAN/rratfr-manager.svg?branch=master)](https://travis-ci.org/RAK3RMAN/rratfr-manager)
![Language](https://img.shields.io/badge/language-HTML/NodeJS-informational.svg?style=flat)

### Full documentation available at [notion.so](https://www.notion.so/a41e54eb6c05450b9d0787a8c5d98928?v=aa4705b0b97442f68cd8ff68766ac138)

### Purpose
This project was created to streamline the organizational efforts of the Rock River Anything That Floats Race. Running on NodeJS, this project displays a powerful web interface where administrators can manage raft information, conduct raft timing, and display results to the public. A smart timing plugin and a custom web voting limiter for the People's Choice Award were both built in-house and from scratch by myself. This manager is now live at [rratfr.rak3rman.com](https://rratfr.rak3rman.com) and has been in use since 2019.

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
