#!/bin/bash

# Start backend
cd /app/backend
python main.py &

# Start frontend
cd /app/frontend
npm start &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
