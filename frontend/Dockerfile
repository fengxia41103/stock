# build environment
FROM node:16.15.1 as builder

ARG NPM_TOKEN
ARG BUILD_FOR=development

# limit heap memory
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max_old_space_size=2048

# Set up code destination
RUN mkdir /code
WORKDIR /code

# Copy app code to host
COPY . /code

ENV PATH /code/node_modules/.bin:$PATH

# npmrc
RUN echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> ~/.npmrc
RUN echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> ~/.yarnrc

# Install app dependencies
# RUN npm install --location=global npm
# RUN npm install --force
RUN yarn install
RUN rm -f .npmrc

# Start the app
RUN ENV=${BUILD_FOR} yarn run build

# production environment
FROM nginx:latest

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

COPY --from=builder /code/build .
