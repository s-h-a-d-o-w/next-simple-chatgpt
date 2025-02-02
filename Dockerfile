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

# See: https://github.com/nodejs/corepack/issues/612#issuecomment-2629496091
RUN npm install -g corepack@latest
# --ignore-scripts because of panda. The full source code is not included in the tarball and so panda would fail.
RUN pnpm install --ignore-scripts

ENV NODE_ENV production
ENV PORT 80
EXPOSE 80
CMD [ "pnpm", "start" ]
