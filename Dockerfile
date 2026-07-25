FROM node:24-slim AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

FROM node:24-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build:fly

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/appsignal.cjs ./appsignal.cjs
COPY --from=builder /app/start-combined.sh ./start-combined.sh
RUN chmod +x start-combined.sh

EXPOSE 5000
CMD ["sh", "start-combined.sh"]
