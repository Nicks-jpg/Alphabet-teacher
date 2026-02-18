# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Копіюємо збірку з попереднього етапу
COPY --from=build /app/dist /usr/share/nginx/html
# Копіюємо конфіг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Копіюємо entrypoint скрипт
COPY entrypoint.sh /docker-entrypoint.d/99-env.sh
RUN chmod +x /docker-entrypoint.d/99-env.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
