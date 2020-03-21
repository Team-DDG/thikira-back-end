FROM node:12
MAINTAINER ljsung0805 <ljsung0805@gmail.com>

ENV NODE_ENV production

ADD . /app
WORKDIR /app

RUN yarn install
RUN yarn build
CMD yarn start:prod
