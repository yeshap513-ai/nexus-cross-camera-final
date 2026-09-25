#!/usr/bin/env bash
while true; do
    echo "Starting tunnel to port 3000..."
    ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -R 80:127.0.0.1:3000 nokey@localhost.run
    echo "Tunnel dropped, reconnecting in 2s..."
    sleep 2
done
