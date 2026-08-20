# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app

# Lockfile first: this layer only rebuilds when dependencies actually change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build          # tsc -b && vite build  ->  /app/dist

# ---- runtime ----
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
