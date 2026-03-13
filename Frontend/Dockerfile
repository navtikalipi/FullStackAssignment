FROM node:lts-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build -- --configuration production

# Nginx stage
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=build /app/dist/stock-portfolio/browser /usr/share/nginx/html

# Copy environment template into Nginx html directory
COPY ./assets/env.template.js /usr/share/nginx/html/assets/env.js

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Expose port
EXPOSE 80

# Replace env variables and start Nginx
CMD envsubst < /usr/share/nginx/html/assets/env.js > /usr/share/nginx/html/assets/env.generated.js && \
    mv /usr/share/nginx/html/assets/env.generated.js /usr/share/nginx/html/assets/env.js && \
    nginx -g "daemon off;"
