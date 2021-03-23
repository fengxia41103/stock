# build environment
# FROM node:12.11.1 as builder
FROM node:12.19.0-alpine3.10 as builder

# Set up code destination
RUN mkdir /code
WORKDIR /code

ENV PATH /code/node_modules/.bin:$PATH
COPY package.json /code/package.json

# Install app dependencies
RUN yarn install

# Copy app code to host
COPY . /code

# Start the app
RUN yarn run build

# production environment
FROM nginx:latest

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

COPY --from=builder /code/build .
