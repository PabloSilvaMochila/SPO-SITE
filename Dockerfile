# ===============================
# Build Frontend
# Stage 1: Build Frontend
# ===============================
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
ENV REACT_APP_BACKEND_URL=/api
RUN npm run build

# ===============================
# Backend
# Stage 2: Backend (Final Image)
# ===============================
FROM python:3.11-slim

WORKDIR /app

COPY backend/ ./backend
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY scripts/ ./scripts

# Frontend buildado
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Ambiente
ENV PYTHONPATH=/app
ENV SECRET_KEY=changeme_in_production
ENV PORT=10000

EXPOSE 10000

CMD ["sh", "-c", "python scripts/seed_doctors.py && gunicorn backend.server:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT"]


