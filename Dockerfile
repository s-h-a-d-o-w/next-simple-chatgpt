FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Building presumably already happened
COPY . .

# See: https://github.com/nodejs/corepack/issues/612#issuecomment-2629496091
RUN npm install -g corepack@latest
RUN pnpm install --prod --ignore-scripts

ENV NODE_ENV production
ENV PORT 80
EXPOSE 80
CMD [ "pnpm", "start" ]
