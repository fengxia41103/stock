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
RUN yarn build

# production environment
FROM nginx:1.19-alphine
COPY nginx.conf /etc/nginx/sites-enabled/feng.conf
COPY --from=builder /code/build /usr/share/nginx/html
