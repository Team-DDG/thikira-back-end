# thikira-back-end

## how to setup

### case. 1 native

#### 1. Tech Stack Version
- node.js: 12.x
- yarn: 1.x (not support 2.x yet)
- mysql: 5.7 or 8.0
- mariadb: 10.x
- monogodb: 4.x

#### 2. Environment
- ENCIPHERMENT
  - password encipherment algorithm
  
- HOST (Optional)
- JWT_SECRET
  - JWT token secret key
  - default: randomBytes(16)
- MONGODB_HOST
- MONGODB_PASS (Optional)
  - this variable used when you use mongodb authorization
  - must use with MONGODB_USER
- MONGODB_PORT
  - default: 27017
- MONGODB_SCHEMA
  - same to mongodb database
- MONGODB_USER (Optional)
  - this variable used when you use mongodb authorization
  - must use with MONGODB_PASS
- MYSQL_HOST
- MYSQL_PASS
- MYSQL_PORT
  - default: 3306
- MYSQL_SCHEMA
  - same to mysql database
- MYSQL_TYPE
  - default: mysql
  - usable value: mysql, mariadb
- MYSQL_USER
- PORT
  - default: 3000

#### 3. commend
- yarn && yarn build
- yarn start (or yarn start:prod)


### case. 2 docker

see https://hub.docker.com/r/thikira/thikira-back-end
