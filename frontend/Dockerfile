FROM node:20-slim AS builder

ARG NPM_TOKEN
ARG VITE_API_URL=/api/v1

ENV NODE_OPTIONS=--max_old_space_size=2048

WORKDIR /code

COPY package.json yarn.lock* .npmrc .yalc/ ./

# If NPM_TOKEN is set, install normally (private registry auth works).
# If not, remove the private package from package.json and install without it,
# then create a stub so imports don't break.
RUN if [ -n "$NPM_TOKEN" ]; then \
      NPM_TOKEN=${NPM_TOKEN} npm install --legacy-peer-deps; \
    else \
      sed -i '/"@fengxia41103\/storybook"/d' package.json && \
      npm install --legacy-peer-deps && \
      mkdir -p node_modules/@fengxia41103/storybook && \
      printf 'const React = require("react");\nconst stub = (props) => React.createElement("div", null, props.children);\nmodule.exports = new Proxy({}, { get: () => stub });\n' > node_modules/@fengxia41103/storybook/index.js && \
      printf '{"name":"@fengxia41103/storybook","version":"0.0.0","main":"index.js"}' > node_modules/@fengxia41103/storybook/package.json; \
    fi && rm -f .npmrc

COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /code/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
