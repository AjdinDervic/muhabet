# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# optionally pass VITE_API_BASE at build time if deploying to a domain
# e.g. docker build --build-arg VITE_API_BASE=https://api.yourdomain
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build   # outputs /app/dist

# ---- serve ----
FROM nginx:alpine
# Basic SPA config
COPY <<'NGINX' /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;

  location / {
    try_files $uri /index.html;
  }

  add_header X-Content-Type-Options nosniff;
  add_header X-Frame-Options DENY;
  add_header Referrer-Policy no-referrer-when-downgrade;
}
NGINX
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
