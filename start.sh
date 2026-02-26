#!/bin/bash

# Start backend
cd /app/backend
python main.py &

# Start frontend (Next.js standalone mode)
cd /app/frontend
node server.js &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
