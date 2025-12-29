# Multi-stage build for Vite + React

FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies (tolerate peer deps from template)
COPY package.json package-lock.json* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install --legacy-peer-deps; fi

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
