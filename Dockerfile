# Etapa 1 - Builder
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# instala todas dependências (dev + prod) para build
RUN npm install

COPY . .

# build
RUN npm run build

# Etapa 2 - Runtime
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# só prod dependencies
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
