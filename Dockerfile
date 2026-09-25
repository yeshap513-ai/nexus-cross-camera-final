# ==============================================================================
# Multi-Stage Dockerfile for NEXUS: Cross-Camera Intelligence
# Combines React (Vite) Frontend Build + Python (FastAPI + YOLOv8) AI Backend
# ==============================================================================

# Stage 1: Build React Tactical Dashboard
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Python AI Engine & Server Runtime
FROM python:3.10-slim AS runner

# Install system dependencies for OpenCV, FFmpeg, and PyTorch
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application, models, and data
COPY backend/ /app/backend/

# Copy built frontend assets into backend static folder
COPY --from=frontend-builder /app/frontend/dist /app/backend/static_frontend

WORKDIR /app/backend

ENV PORT=8000
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Start unified FastAPI server with dynamic PORT binding
CMD ["sh", "-c", "python3 -m uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
