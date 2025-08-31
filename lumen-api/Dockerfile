# Multi-stage build: Use official Composer image for dependency installation
FROM composer:latest AS composer-stage

# Set working directory
WORKDIR /app

# Copy composer files
COPY composer.json composer.lock* ./

# Install dependencies using official Composer image (bypasses SSL issues)
RUN composer install --optimize-autoloader --no-scripts --no-interaction --ignore-platform-reqs --no-dev

# Main application stage
FROM php:8.2-cli

# Set working directory
WORKDIR /var/www/html

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libsqlite3-dev \
    zip \
    unzip \
    git \
    curl \
    ca-certificates \
    wget \
    && update-ca-certificates \
    && docker-php-ext-install pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

# Copy Composer binary from official image
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Copy vendor directory from composer stage
COPY --from=composer-stage /app/vendor ./vendor

# Copy application code
COPY . .

# Environment variables will be set by docker-compose.yml

# Testing environment will be configured separately if needed

# Create storage directories and set permissions
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

# Generate application key if needed
RUN php artisan key:generate --force || echo "Key generation skipped"

# Clear configuration cache
RUN php artisan config:clear || echo "Config clear skipped"

# Generate JWT secret if possible
RUN php artisan jwt:secret --force || echo "JWT secret generation skipped"

# Run database migrations (will use SQLite for testing)
RUN php artisan migrate --force || echo "Migrations skipped"

# Expose port for PHP built-in server
EXPOSE 8000

# Start PHP built-in server
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]