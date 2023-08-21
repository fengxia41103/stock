# build environment
FROM node:16.15.1 as builder

# limit heap memory
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max_old_space_size=2048

# Set up code destination
RUN mkdir /code
WORKDIR /code

# Copy app code to host
COPY . /code

ENV PATH /code/node_modules/.bin:$PATH

# Install app dependencies
RUN yarn install
RUN yarn upgrade

# Start the app
RUN yarn run build

# production environment
FROM nginx:latest

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

COPY --from=builder /code/build .
