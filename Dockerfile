# Multi-stage build for production

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend + Frontend runtime
FROM python:3.11-slim

# Install Node.js for serving frontend
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/

# Copy built frontend
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder /app/frontend/next.config.js ./frontend/

WORKDIR /app/frontend
RUN npm install --production

# Expose ports
EXPOSE 3000 8000

# Start script
WORKDIR /app
COPY start.sh ./
RUN chmod +x start.sh

CMD ["./start.sh"]
