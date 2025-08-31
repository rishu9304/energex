# Multi-stage build for React app
FROM node:16-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies with specific versions to avoid conflicts
RUN npm install --legacy-peer-deps --force --no-audit --no-fund

# Copy source code
COPY . .

# Set environment variables for build
ENV GENERATE_SOURCEMAP=false
ENV CI=false
ENV NODE_OPTIONS=--max_old_space_size=4096

# Build the React app
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built React app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]