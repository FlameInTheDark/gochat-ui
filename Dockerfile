# Dockerfile

# ---- Builder Stage ----
# Use a specific Node.js version (Alpine for smaller size)
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies using npm ci for consistency
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the SvelteKit application
# PUBLIC_API_BASE_URL will be read at runtime via $env/dynamic/public
RUN npm run build

# ---- Runner Stage ----
# Use a minimal Node.js Alpine image for the final container
FROM node:20-alpine AS runner

# Set the working directory
WORKDIR /app

# Copy necessary files from the builder stage
# - The built application (usually in 'build')
# - package.json and package-lock.json for production dependencies
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./package-lock.json

# Install only production dependencies
RUN npm ci --omit=dev

# Expose the port the app runs on
# Default for adapter-node is 3000, but we make it configurable
EXPOSE ${PORT:-3000}

# Set default environment variables
# These can be overridden at runtime
ENV HOST=0.0.0.0
ENV PORT=3000
# ORIGIN is often required by SvelteKit for CSRF protection, etc.
# Set it to your public URL in production
ENV ORIGIN="http://${HOST}:${PORT}"
# Add PUBLIC_API_BASE_URL to be set at runtime
# This MUST start with 'PUBLIC_' for $env/dynamic/public to pick it up
ENV PUBLIC_API_BASE_URL=""
# Add PUBLIC_WEBSOCKET_URL to be set at runtime
ENV PUBLIC_WEBSOCKET_URL=""

# Add other environment variables your application needs here
# ENV DATABASE_URL=...
# ENV API_KEY=...

# Command to run the application
# adapter-node creates an entry point in build/index.js
CMD ["node", "build/index.js"] 