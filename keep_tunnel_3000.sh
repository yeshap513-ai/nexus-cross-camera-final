#!/bin/bash
# NEXUS Port 3000 Tunnel Daemon
TUNNEL_LOG="tunnel_3000.log"
URL_FILE="public_tunnel_url.txt"

cd "$(dirname "$0")"

while true; do
    echo "[$(date)] Starting tunnel connection for port 3000..." >> "$TUNNEL_LOG"
    
    ssh -o StrictHostKeyChecking=no \
        -o ServerAliveInterval=15 \
        -o ServerAliveCountMax=4 \
        -o ExitOnForwardFailure=yes \
        -R 80:localhost:3000 nokey@localhost.run > "$TUNNEL_LOG" 2>&1 &
    SSH_PID=$!
    
    TUNNEL_URL=""
    for i in {1..30}; do
        sleep 1
        TUNNEL_URL=$(grep -o 'https://[a-zA-Z0-9.-]*\.lhr\.life' "$TUNNEL_LOG" | head -n 1)
        if [ -n "$TUNNEL_URL" ]; then
            echo "$TUNNEL_URL" > "$URL_FILE"
            echo "Tunnel live at: $TUNNEL_URL"
            break
        fi
    done
    
    while kill -0 "$SSH_PID" 2>/dev/null; do
        sleep 30
        if [ -n "$TUNNEL_URL" ]; then
            curl -s -m 10 -o /dev/null "$TUNNEL_URL/api/status" 2>/dev/null || true
        fi
    done
    
    echo "[$(date)] Tunnel disconnected, reconnecting in 2s..." >> "$TUNNEL_LOG"
    sleep 2
done
