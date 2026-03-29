#syntax=docker/dockerfile:1

# Stage 0, for downloading project’s npm dependencies, building and compiling the app.
ARG NGINX_VERSION=1.25.5-alpine3.19@sha256:09ad4fe02b1d19c9b302af0f063a4511924ffc79abe1a50394400527c63ea6fa
ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION} AS build

# set working directory
WORKDIR /app

# install package.json (o sea las dependencies)
COPY package*.json /app/
RUN npm install --maxsockets 1

# add app
COPY src /app/src
COPY angular.json /app/
COPY tsconfig*.json /app/
COPY tailwind.config.js /app/

ARG configuration=observatory

# build app
RUN npm run build  --configuration $configuration

# Stage 1, for copying the compiled app from the previous step and making it ready for production with Nginx
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION}

ENV JSFOLDER="/app/*.js"

USER 0
COPY --chmod=755 ./start-nginx.sh /usr/bin/start-nginx.sh
COPY ./nginx.observatory.conf /etc/nginx/nginx.conf

WORKDIR /app-mngt
COPY healthcheck.json .

WORKDIR /app
COPY --from=build /app/dist/apps/observatory/ /app/
RUN chmod -R g+rwX /app/

USER 1001
EXPOSE 8080
ENTRYPOINT [ "start-nginx.sh" ]
