FROM nginx:alpine
# Копіюємо ВСЕ що є
COPY . /usr/share/nginx/html/
# Створюємо sounds
RUN mkdir -p /usr/share/nginx/html/sounds && \
    chmod 755 /usr/share/nginx/html/sounds
# nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


