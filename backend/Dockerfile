# PHP Backend Dockerfile - Railway Optimized (PHP-FPM + Nginx)
FROM php:8.2-fpm

# Install required PHP extensions
RUN docker-php-ext-install pdo pdo_mysql

# Install nginx
RUN apt-get update && apt-get install -y nginx

# Create nginx configuration - handles both API and static files
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /var/www/html; \
    \
    # API routing - /api/* -> /api/*.php \
    location /api/ { \
        try_files $uri $uri/ /api$uri.php?$query_string; \
    } \
    \
    # PHP processing for API \
    location ~ ^/api(.+\.php)$ { \
        try_files $1 =404; \
        fastcgi_split_path_info ^/api(.+\.php)(/.+)$; \
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock; \
        fastcgi_index index.php; \
        include fastcgi_params; \
        fastcgi_param SCRIPT_FILENAME $document_root/api$fastcgi_script_name; \
        fastcgi_param PATH_INFO $fastcgi_path_info; \
        fastcgi_param REQUEST_URI $request_uri; \
    } \
    \
    # Root index.html for testing \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location ~ /\.ht { \
        deny all; \
    } \
}' > /etc/nginx/sites-available/default

# Copy application files
COPY . /var/www/html/

# Create uploads directory with proper permissions
RUN mkdir -p /var/www/html/uploads && \
    chmod -R 755 /var/www/html/uploads

# Create PHP-FPM socket directory
RUN mkdir -p /var/run/php && \
    chown -R www-data:www-data /var/run/php

# Set environment variables
ENV APP_ENV=production

# Start PHP-FPM and Nginx using supervisor
RUN apt-get install -y supervisor

RUN mkdir -p /var/log/supervisor

RUN echo '[supervisord]\nnodaemon=true\n\n[program:php-fpm]\ncommand=/usr/local/sbin/php-fpm\nautorestart=true\n\n[program:nginx]\ncommand=/usr/sbin/nginx -g "daemon off;"\nautorestart=true' > /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord"]
