#!/bin/sh

# Генеруємо env-config.js
echo "window._env_ = {" > /usr/share/nginx/html/env-config.js
if [ -n "$API_KEY" ]; then
  echo "  API_KEY: \"$API_KEY\"" >> /usr/share/nginx/html/env-config.js
elif [ -n "$VITE_API_KEY" ]; then
  echo "  API_KEY: \"$VITE_API_KEY\"" >> /usr/share/nginx/html/env-config.js
fi
echo "};" >> /usr/share/nginx/html/env-config.js
