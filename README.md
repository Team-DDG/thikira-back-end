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
- ENCRYPTION
  - password encryption algorithm
  
- HOST (Optional)
- JWT_SECRET
    - JWT token secret key
  - default: randomBytes(16)
- MONGO_URL
  - with log in: mongodb://{username}:{password}@{host}:{port}/{database}?{options}
  - without log in: mongodb://{host}:{port}/{database}?{options}
- DATABASE_TYPE
  - default: mysql
  - usable value: mysql, mariadb
- DATABASE_URL
  - example: mysql://{username}:{password}@{host}:{port}/{database}?{options}
- PORT
  - default: 3000

#### 3. commend
- yarn && yarn build
- yarn start (or yarn start:prod)


### case. 2 docker

see https://hub.docker.com/r/deadeokdevelopergroup/thikira-back-end
