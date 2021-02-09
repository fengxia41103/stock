# build environment
FROM node:12.11.1 as builder

# Set up code destination
RUN mkdir /code
WORKDIR /code

ENV PATH /code/node_modules/.bin:$PATH
COPY package.json /code/package.json
RUN npm install --silent
RUN npm install react-scripts@1.1.1 -g --silent
COPY . /code
RUN npm run build

# production environment
FROM nginx:1.13.9-alpine
COPY nginx.conf /etc/nginx/sites-enabled/feng.conf
COPY --from=builder /code/dist /usr/share/nginx/html
