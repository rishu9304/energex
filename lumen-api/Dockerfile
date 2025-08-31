# Use official PHP CLI image
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
    && update-ca-certificates \
    && docker-php-ext-install pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd zip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer using the official installer with SSL fix
RUN curl -k -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && chmod +x /usr/local/bin/composer

# Copy composer files first for better caching
COPY composer.json ./

# Install dependencies with SSL workaround (including dev dependencies for testing)
RUN composer config --global disable-tls true && \
    composer config --global secure-http false && \
    composer install --optimize-autoloader --no-scripts --no-interaction --ignore-platform-reqs

# Copy application code
COPY . .

# The Lumen public/index.php is already copied with the application code
# It will use the proper Lumen framework with CORS middleware and all features

# Create .env file
RUN echo "APP_NAME=Energex" > .env && \
    echo "APP_ENV=local" >> .env && \
    echo "APP_DEBUG=true" >> .env && \
    echo "DB_HOST=mysql" >> .env && \
    echo "DB_DATABASE=energex" >> .env && \
    echo "DB_USERNAME=energex" >> .env && \
    echo "DB_PASSWORD=secret" >> .env && \
    echo "REDIS_HOST=redis" >> .env && \
    echo "JWT_SECRET=your-secret-key" >> .env

# Create .env.testing file for PHPUnit tests
RUN echo "APP_NAME=Energex" > .env.testing && \
    echo "APP_ENV=testing" >> .env.testing && \
    echo "APP_DEBUG=true" >> .env.testing && \
    echo "DB_CONNECTION=sqlite" >> .env.testing && \
    echo "DB_DATABASE=:memory:" >> .env.testing && \
    echo "CACHE_DRIVER=array" >> .env.testing && \
    echo "QUEUE_CONNECTION=sync" >> .env.testing && \
    echo "JWT_SECRET=your-secret-key" >> .env.testing

# Create storage directories and set permissions
RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

# Expose port for PHP built-in server
EXPOSE 8000

# Start PHP built-in server
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]