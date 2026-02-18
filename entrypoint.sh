#!/bin/sh

# Створюємо файл конфігурації JS з API_KEY
echo "window._env_ = {" > /usr/share/nginx/html/env-config.js
echo "  API_KEY: \"$API_KEY\"" >> /usr/share/nginx/html/env-config.js
echo "};" >> /usr/share/nginx/html/env-config.js

# Цей скрипт запускається автоматично Nginx перед стартом,
# тому тут не потрібно викликати /docker-entrypoint.sh
