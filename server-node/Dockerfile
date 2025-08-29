# Node/Express Multi-Agent Backend
FROM node:20-alpine AS base

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

EXPOSE 8000
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]

