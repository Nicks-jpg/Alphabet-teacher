FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --prefer-offline --no-audit --network-timeout 100000
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /usr/share/nginx/html/sounds && chmod 755 /usr/share/nginx/html/sounds
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
