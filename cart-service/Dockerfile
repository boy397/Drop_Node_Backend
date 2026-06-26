# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package descriptors to install all dependencies (including devDependencies)
COPY package*.json ./

# Install all dependencies at the root
RUN npm install

# Copy source files
COPY shared ./shared
COPY cart-service ./cart-service

# Build the service
WORKDIR /app/cart-service
RUN npm run build

# --- Runner Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy root package descriptors to install production dependencies
COPY package*.json ./

# Install production dependencies at the root
RUN npm install --only=production

# Copy compiled JavaScript output from the builder stage
COPY --from=builder /app/cart-service/dist ./dist

EXPOSE 5003

CMD ["node", "dist/cart-service/src/server.js"]
