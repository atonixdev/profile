# Development stage
FROM node:18-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose port
EXPOSE 3000

CMD ["npm", "start"]

# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Use npm install to avoid lockfile sync errors when package-lock.json is absent
RUN npm install --omit=dev

# Copy project files
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx && adduser -S nginx -G nginx
USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
