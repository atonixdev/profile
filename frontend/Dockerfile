# Base image
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the app
RUN npm run build

# -----------------------------
# Production stage (Node server)
# -----------------------------
FROM node:18-alpine AS production

WORKDIR /app

# Install a lightweight static server
RUN npm install -g serve

# Copy build output from previous stage
COPY --from=build /app/build ./build

# Expose port
EXPOSE 3000

# Serve the production build
CMD ["serve", "-s", "build", "-l", "3000"]