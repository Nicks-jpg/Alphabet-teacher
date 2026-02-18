FROM nginx:alpine
# Копіюємо React build
COPY dist/ /usr/share/nginx/html/
COPY public/ /usr/share/nginx/html/public/
# Фікс nginx html dir (mkdir sounds якщо немає)
RUN mkdir -p /usr/share/nginx/html/sounds && \
    chmod -R 755 /usr/share/nginx/html/sounds
# nginx.conf для SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
