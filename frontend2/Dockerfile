# build environment
# FROM node:12.11.1 as builder
FROM node:12.19.0-alpine3.10 as builder

# Set up code destination
RUN mkdir /code
WORKDIR /code

ENV PATH /code/node_modules/.bin:$PATH
COPY package.json /code/package.json
#RUN npm install --silent
#COPY . /code
#RUN npm run build

# Install app dependencies
RUN yarn install

# Copy app code to host
COPY . /code

# Open specified port
EXPOSE 3000:3000

# Start the app
CMD ["yarn", "run", "start", "production"]

# production environment
FROM nginx:latest
COPY nginx.conf /etc/nginx/sites-enabled/feng.conf
COPY --from=builder /code/build /usr/share/nginx/html
