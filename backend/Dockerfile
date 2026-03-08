# PHP Backend Dockerfile - Railway CLI Server
FROM php:8.2-cli

# Install required PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copy application files
COPY . /app

# Set working directory
WORKDIR /app

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads

# Configure PHP settings for file uploads
RUN echo "upload_max_filesize = 50M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "post_max_size = 50M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "max_execution_time = 300" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/uploads.ini

# Set environment variables
ENV APP_ENV=production

# Expose port 8080
EXPOSE 8080

# Start PHP built-in server with router
CMD ["php", "-S", "0.0.0.0:8080", "router.php"]
