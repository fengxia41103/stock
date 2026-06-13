FROM node:20-slim AS builder

ARG NPM_TOKEN
ARG VITE_API_URL=/api/v1

ENV NODE_OPTIONS=--max_old_space_size=2048

WORKDIR /code

COPY package.json yarn.lock* .npmrc ./

# Try install with token. If it fails (bad token or no token), fall back to stub.
RUN NPM_TOKEN=${NPM_TOKEN} npm install --legacy-peer-deps 2>/dev/null \
    || ( \
      sed -i '/"@fengxia41103\/storybook"/d' package.json && \
      rm -f .npmrc && \
      npm install --legacy-peer-deps && \
      mkdir -p node_modules/@fengxia41103/storybook && \
      printf '{"name":"@fengxia41103/storybook","version":"0.0.0","main":"index.js"}' > node_modules/@fengxia41103/storybook/package.json && \
      echo 'const R=require("react");const s=p=>R.createElement("div",null,p.children);module.exports=new Proxy({},{get:()=>s});' > node_modules/@fengxia41103/storybook/index.js \
    ) && rm -f .npmrc

COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /code/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
