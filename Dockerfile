# Fase 1: Build
FROM node:24-alpine AS builder

WORKDIR /usr/src/app
RUN corepack enable

COPY package*.json ./
RUN pnpm install

COPY . .

ARG DATABASE_URL

ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate

RUN pnpm run build

# Fase 2: Produção
FROM node:24-alpine

WORKDIR /usr/src/app
RUN corepack enable

COPY package*.json ./
RUN pnpm install --only=production

# Copia os artefatos do build de fase 1
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3000

# Roda a aplicação
CMD ["node", "dist/main.js"]