FROM node:16-alpine

LABEL MAINTAINER Najee McGreen <najee.mcgreen@sunalgo.com>

WORKDIR /usr/src
ENV NODE_ENV=development

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN apk add make g++ python3
RUN JOBS=MAX npm install --unsafe-perm && npm cache verify && rm -rf /tmp/
COPY src src
COPY .env .env


EXPOSE ${PORT}

CMD npm run dev