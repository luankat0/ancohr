# Fase 1: Build
FROM node:24-alpine AS builder

WORKDIR /usr/src/app
RUN corepack enable

COPY package*.json ./
RUN pnpm install

COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

RUN pnpm run build

# Fase 2: Produção
FROM node:24-alpine

WORKDIR /usr/src/app
RUN corepack enable

COPY package*.json ./
RUN pnpm install --only=production

# Copia os artefatos do build
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

# Roda a aplicação
CMD ["node", "dist/main.js"]