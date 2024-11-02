FROM node:20-alpine AS base
# husky requires git
RUN apk update && \
    apk add --no-cache git
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
# Building presumably already happened
COPY . .

RUN pnpm install --frozen-lockfile --ignore-scripts

ENV NODE_ENV production
ENV PORT 80
EXPOSE 80
CMD [ "pnpm", "start" ]
