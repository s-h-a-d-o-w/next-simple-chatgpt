FROM node:20-alpine AS base

# Building presumably already happened
COPY . .

ENV NODE_ENV production
ENV PORT 80
EXPOSE 80
CMD [ "pnpm", "start" ]
