FROM node:12
MAINTAINER ljsung0805 <ljsung0805@gmail.com>

ENV NODE_ENV production

ADD . /app
WORKDIR /app

CMD node ./node_modules/yarn/bin/yarn.js yarn start:prod
