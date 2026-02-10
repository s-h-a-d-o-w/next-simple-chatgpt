# See https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
FROM node:24-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apk add --no-cache git libc6-compat
RUN corepack enable

COPY . .

RUN pnpm install
RUN pnpm build

FROM base AS runner
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=80
ENV HOSTNAME="0.0.0.0"
EXPOSE 80
CMD [ "node", "server.js" ]
