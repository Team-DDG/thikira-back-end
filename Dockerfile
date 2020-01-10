FROM node:12
MAINTAINER ljsung0805 <ljsung0805@gmail.com>

ADD . /app
WORKDIR /app

RUN yarn && yarn build

ENV NODE_ENV production
CMD yarn start:prod
