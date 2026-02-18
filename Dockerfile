FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json vite.config.ts tsconfig.json ./
RUN npm ci
COPY . .
RUN npm run build  # Створить dist/

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /usr/share/nginx/html/sounds && chmod 755 /usr/share/nginx/html/sounds
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
