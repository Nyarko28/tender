# PHP Backend Dockerfile - Railway CLI Server
FROM php:8.2-cli

# Install required PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html/

# Create uploads directory with proper permissions
RUN mkdir -p /var/www/html/uploads && \
    chmod -R 755 /var/www/html/uploads

# Set environment variables
ENV APP_ENV=production

# Expose port 8080
EXPOSE 8080

# Start PHP built-in server with router
CMD ["php", "-S", "0.0.0.0:8080", "router.php"]
