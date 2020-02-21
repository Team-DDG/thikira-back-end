FROM node:12
MAINTAINER ljsung0805 <ljsung0805@gmail.com>

ENV NODE_ENV production

ADD . /app
WORKDIR /app

RUN npm i yarn@berry
RUN node ./node_modules/yarn/bin/yarn.js install
RUN node ./node_modules/yarn/bin/yarn.js build
CMD node ./node_modules/yarn/bin/yarn.js start:prod
