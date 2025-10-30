# Dockerfile (place at repo root)
FROM php:8.2-apache

# Install system deps we need (git, unzip for composer packages) and enable rewrite
RUN apt-get update \
  && apt-get install -y git unzip zip libzip-dev \
  && docker-php-ext-install zip \
  && a2enmod rewrite

# Copy composer binary from the official composer image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy the app into the image
COPY . .

# Make Apache's DocumentRoot point to public/ and allow .htaccess overrides.
RUN sed -ri "s|/var/www/html|/var/www/html/public|g" /etc/apache2/sites-available/*.conf \
  && sed -ri "s|/var/www/html|/var/www/html/public|g" /etc/apache2/apache2.conf \
  && sed -ri "s/AllowOverride None/AllowOverride All/g" /etc/apache2/apache2.conf \
  && a2enmod rewrite \
  # Install PHP deps (Twig) using composer (reads composer.json at repo root)
  && composer install --no-dev --optimize-autoloader --no-interaction \
  # Fix permissions
  && chown -R www-data:www-data /var/www/html

# Set a default ServerName to avoid warning
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Optional: reduce Apache log level to suppress notices
RUN echo "LogLevel warn" >> /etc/apache2/apache2.conf

EXPOSE 80
CMD ["apache2-foreground"]

