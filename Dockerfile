## I hope this works
FROM node:22-alpine AS builder

WORKDIR /app


COPY package.json package-lock.json ./
RUN npm ci


COPY . .


RUN npm run build
FROM node:22-alpine

WORKDIR /app


RUN apk add --no-cache dumb-init


COPY package.json package-lock.json ./


RUN npm ci --only=production


COPY --from=builder /app/build ./build

ENV NODE_ENV=production
ENV PORT=3000
# adapter-node rejects request bodies over 512K by default; project forms carry up to two 5MB screenshots
ENV BODY_SIZE_LIMIT=12M

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]


CMD ["node", "build"]
