# build environment
FROM node:14.17-alpine3.11 as builder

# Set up code destination
RUN mkdir /code
WORKDIR /code

ENV PATH /code/node_modules/.bin:$PATH
COPY package.json /code/package.json

# Install app dependencies
RUN yarn install
RUN yarn upgrade

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
