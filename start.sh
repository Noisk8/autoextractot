#!/bin/bash

echo "=== Starting Auto Extractor ==="

# Start backend (FastAPI en puerto 8000)
echo "[1/2] Starting Python backend..."
cd /app/backend
python main.py &
BACKEND_PID=$!

# Esperar a que el backend esté listo
echo "Waiting for backend to be ready..."
for i in $(seq 1 30); do
    if curl -sf http://127.0.0.1:8000/ > /dev/null 2>&1; then
        echo "Backend is ready!"
        break
    fi
    echo "Attempt $i/30 - backend not ready yet, waiting..."
    sleep 1
done

# Start frontend (Next.js standalone)
echo "[2/2] Starting Next.js frontend..."
cd /app/frontend
HOSTNAME=0.0.0.0 PORT=3000 node server.js &
FRONTEND_PID=$!

echo "=== All services started ==="
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Mantener el contenedor vivo y salir si alguno de los procesos muere
wait $BACKEND_PID $FRONTEND_PID
