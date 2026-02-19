# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:k8s

# --- Runtime stage (Node/Express on 8080) ---
FROM node:20-alpine
WORKDIR /app

# install only production deps (includes express)
COPY package*.json ./
RUN npm ci --omit=dev

# copy server + built site
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./server.js

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
