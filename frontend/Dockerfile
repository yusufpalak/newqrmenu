FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Nitro expects public assets available under server/chunks/public for the
# node-server build. Ensure public assets are copied there so the runtime can
# serve files referenced under /_nuxt.
RUN mkdir -p .output/server/chunks/public && cp -r .output/public/* .output/server/chunks/public/ || true

EXPOSE 3000

# Use node to run directly instead of npm preview
CMD ["node", ".output/server/index.mjs"]
