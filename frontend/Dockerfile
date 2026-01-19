# Base image
FROM node:18-alpine AS build

WORKDIR /app

# CRA builds can exceed Node's default heap inside Docker/cgroups.
# Allow overriding via build args and reduce memory pressure by disabling sourcemaps.
ARG NODE_OPTIONS=--max_old_space_size=4096
ENV NODE_OPTIONS=$NODE_OPTIONS
ENV GENERATE_SOURCEMAP=false

# CRA reads REACT_APP_* at build time. These can be provided as Docker build args.
ARG REACT_APP_API_URL
ARG REACT_APP_MAPBOX_TOKEN
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_MAPBOX_TOKEN=$REACT_APP_MAPBOX_TOKEN

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