# Thikira

## how to setup

### share part

#### 1. env
- ENCIPHERMENT
  - password encipherment
 
- HOST (Optional)
- JWT_SECRET (Optional)
  - default: random string
- MONGODB_HOST
- MONGODB_PASS (Optional)
  - must use with MONGODB_USER
- MONGODB_PORT (Optional)
  - default: 27017
- MONGODB_SCHEMA
- MONGODB_USER (Optional)
  - must use with MONGODB_PASS
- MYSQL_HOST
- MYSQL_PASS
- MYSQL_PORT (Optional)
  - default: 3306
- MYSQL_SCHEMA
- MYSQL_TYPE (Optional)
  - default: mysql
  - usable value: mysql or mariadb
- MYSQL_USER
- PORT (Optional)
  - default: 3000
### case. 1 native

#### 1. Node.js
- version: 12.x

#### 2. yarn
- version: 1.x (not support 2.x yet)

#### 3. mysql
- mysql
  - version: 8.0
- mariadb
  - version 10.4

#### 4. monogodb
- version 4.x

#### 5. commend
- yarn && yarn build
- yarn start (or yarn start:prod)

### case. 2 docker

see https://hub.docker.com/r/thikira/thikira-back-end
