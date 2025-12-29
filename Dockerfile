# Multi-stage build for Vite + React
# Use debian-based image (glibc) to avoid rollup musl optional dependency issues
FROM node:18-bullseye-slim AS builder
WORKDIR /app

# Install dependencies (tolerate peer deps from template)
COPY package.json package-lock.json* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install --legacy-peer-deps; fi
# Ensure rollup native binary is present (npm optional dep bug workaround)
RUN npm install --no-save @rollup/rollup-linux-x64-gnu || true

# Build
COPY . .
ARG VITE_API_BASE_URL=http://127.0.0.1:8040
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# Serve with nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
