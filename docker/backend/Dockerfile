FROM php:8.3-fpm

RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libonig-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip \
    && rm -rf /var/lib/apt/lists/*

COPY docker/backend/uploads.ini /usr/local/etc/php/conf.d/uploads.ini

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copied separately so `composer install` is cached unless composer.json/lock change.
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-scripts --no-autoloader --prefer-dist

COPY backend/ .
RUN composer dump-autoload --optimize \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000

# storage/ and bootstrap/cache/ must be writable by php-fpm (www-data). The
# build-time chown above only affects the image; once the bind-mounted host
# directory is mounted over it at runtime, its ownership shadows the image's,
# so we reapply the same chown on every container start.
CMD sh -c "chown -R www-data:www-data storage bootstrap/cache && php-fpm"
