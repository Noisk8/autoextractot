# Multi-stage build for production

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend + Frontend runtime
FROM python:3.11-slim

# Solo instalar Node.js runtime (sin npm, sin los 649 paquetes extra)
RUN apt-get update && apt-get install -y --no-install-recommends nodejs && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Backend
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend/ ./backend/

# Frontend standalone (no necesita npm install ni node_modules)
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend/
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public

# Expose ports
EXPOSE 3000 8000

# Start script
WORKDIR /app
COPY start.sh ./
RUN chmod +x start.sh

CMD ["./start.sh"]
