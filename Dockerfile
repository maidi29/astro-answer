FROM node:22-slim

LABEL fly_launch_runtime="nodejs"

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

CMD [ "node", "./bin/www" ]
