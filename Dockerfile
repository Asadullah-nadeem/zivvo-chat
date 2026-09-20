FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install

FROM base AS server-build
WORKDIR /app
COPY . .
RUN npm run server:build

FROM base AS frontend-build
WORKDIR /app
COPY . .
RUN npm run frontend:build

FROM node:20-alpine AS server-runtime
WORKDIR /app
COPY --from=base /app/node_modules /app/node_modules
COPY --from=server-build /app/api/server.js /app/api/
COPY --from=server-build /app/package.json /app/
EXPOSE 5000
CMD ["node", "api/server.js"]

FROM node:20-alpine AS frontend-runtime
WORKDIR /app
COPY --from=base /app/node_modules /app/node_modules
COPY --from=frontend-build /app/.next /app/.next
COPY --from=frontend-build /app/public /app/public
COPY --from=frontend-build /app/package.json /app/
COPY --from=frontend-build /app/next.config.ts /app/
EXPOSE 3000
CMD ["npm", "run", "frontend:start"]