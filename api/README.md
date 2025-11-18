Node Version: 18.17.0
Typescript: 5.3.3

Setup SSL ON SERVER

## Installation NGINX and Certbot

```bash
  sudo apt install nginx
  sudo apt install certbot python3-certbot-nginx
```

## Setup File for Site and nginx endpoint

```bash
  sudo nano /etc/nginx/sites-available/sitename.com

  server {
    server_name sitename.com
  
  	location / {
  		proxy_pass http://127.0.0.1:PORT;
  		proxy_http_version 1.1;
  		proxy_set_header Upgrade $http_upgrade;
  		proxy_set_header Connection 'upgrade';
  		proxy_set_header Host $host;
  		proxy_cache_bypass $http_upgrade;
  	}
  }
```

## Auto Generate SSL Certificate

```bash
  sudo certbot --nginx -d sitename.com
  sudo certbot --nginx -d domain.sitename.com
```

## Status of Nginx

```bash
 sudo systemctl status nginx
```

## Test config file of ngnix

```bash
  sudo nginx -t
```

## Restart nginx

```bash
 sudo systemctl restart nginx
```

## PostgreSQL Database Setup on New Server

### Install PostgreSQL

```bash
  sudo apt update
  sudo apt install postgresql
```

### Start and Enable PostgreSQL Service

```bash
  sudo systemctl start postgresql
  sudo systemctl enable postgresql
  sudo systemctl status postgresql
```

### Access PostgreSQL and Create Database

```bash
  sudo -u postgres psql
  
  # Create a new database
  CREATE DATABASE your_database_name;
  
  # Create a new user
  CREATE USER your_username WITH PASSWORD 'your_password';
  
  # Grant privileges to user
  GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_username;
  
  # Exit PostgreSQL
  \q
```

### Configure PostgreSQL for Remote Access (Optional)

```bash
  # Edit PostgreSQL configuration
  sudo nano /etc/postgresql/*/main/postgresql.conf
  
  # Uncomment and modify the line:
  # listen_addresses = 'localhost'
  # Change to:
  # listen_addresses = '*'
  
  # Edit client authentication configuration
  sudo nano /etc/postgresql/*/main/pg_hba.conf
  
  # Add this line for remote connections:
  # host    all             all             0.0.0.0/0               md5
  
  # Restart PostgreSQL
  sudo systemctl restart postgresql
```

### Test Database Connection

```bash
  psql -h localhost -U your_username -d your_database_name
```

## API Project Setup

### Clone and Setup Project

```bash
  # Clone your React project
  git clone https://github.com/Aatul151/jason-li-talent-directory-api.git
  cd jason-li-talent-directory-api
  
  # Install dependencies
  npm install

  # Run project
  npm run start
```

### Set Environment Variables for Production/DEV

```bash
  file : jason-li-talent-directory-api\.env_example

  # take reference of .env_example file and create .env file with all variable and set value as per new configuration

  # Create production build
  npm run build
  
  # The build folder will be created in your project directory
  # Usually located at: ./build/

  move all files from .build/ folder to production api project folder
  also upload package.json file

  #do npm install on production
  npm install or yarn install

  pm2 restart {process_id}
```    

## Web Project Setup

### Clone and Setup Project

```bash
  # Clone your React project
  git clone https://github.com/Aatul151/jason-li-talent-directory.git
  cd jason-li-talent-directory
  
  # Install dependencies
  npm install

  # Run project
  npm run start
```

### Set Environment Variables for Production

```bash
  file : jason-li-talent-directory\src\services\api-helper.tsx

  #variables need to update in above file
  APIURL: "https://{APIDomain}/api/v1/";
  IMAGEPATH: "https://{APIDomain}";
  WEB_URL: "https://{WebDomain}";
  # {APIDomain} and {Webdomain} are variable set your host according

  # Create production build
  npm run build
  
  # The build folder will be created in your project directory
  # Usually located at: ./build/

  move all files from .build/ folder to production web project folder
```    

## ADMIN Panel Project Setup

### Clone and Setup Project

```bash
  # Clone your React project
  git clone https://github.com/Aatul151/jason-li-talent-directory-admin.git
  cd jason-li-talent-directory-admin
  
  # Install dependencies
  npm install

  # Run project
  npm run start

  # Restart pm2 service
  pm2 restart {process_id}
```

### Set Environment Variables for Production

```bash
  file : jason-li-talent-directory-admin\src\services\api-helper.js

  #variables need to update in above file
  APIURL: "https://{APIDomain}/api/v1/";
  IMAGEPATH: "https://{APIDomain}";
  # {APIDomain} is variable set your host according

  # Create production build
  npm run build
  
  # The build folder will be created in your project directory
  # Usually located at: ./build/

  move all files from .build/ folder to production admin project folder

  # Restart pm2 service
  pm2 restart {process_id}
```    

## Note: If you want to move/clone server with same data then
1. From superadmin login please take backup from dashboard page.
2. backup has database backup script and media backup zip folder
   path : /home/ubuntu/talent-directory/api/public_backup 
3. from above path extract media_backup.zip file to new server api/public folder 
4. from above path db_backup_{date}.sql which is dump file of latest db
