#!/bin/bash

# Salesdex Development Setup Script

echo "🚀 Salesdex Development Setup"
echo "============================"

# Check if MinIO is running
if ! docker ps | grep -q "salesdex-minio"; then
    echo "📦 Starting MinIO..."
    docker-compose -f docker-compose.minio.yml up -d
    echo "✅ MinIO started (http://localhost:9001)"
else
    echo "✅ MinIO is already running"
fi

# Load environment variables
if [ -f .env.dev ]; then
    echo "🔧 Loading environment variables..."
    export $(cat .env.dev | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "⚠️  .env.dev file not found. Creating one..."
    cp .env.dev.example .env.dev 2>/dev/null || echo "DATABASE_URL=postgresql://username:password@your-aws-postgres.rds.amazonaws.com:5432/salesdex" > .env.dev
    echo "MINIO_ENDPOINT=localhost" >> .env.dev
    echo "WEBHOOK_SECRET=dev-webhook-secret-change-in-production" >> .env.dev
    echo "JWT_SECRET=your-super-secret-jwt-key" >> .env.dev
    echo "VITE_API_URL=http://localhost:3000" >> .env.dev
    echo "✅ .env.dev created. Please update your DATABASE_URL"
fi

# Start development services
echo "🏗️  Starting development services..."
docker-compose -f docker-compose.dev.yml up -d

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo "📱 MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"
echo "🔧 Backend API: http://localhost:3000"
echo "🌐 Webapp: http://localhost:3001"
echo ""
echo "📝 To view logs:"
echo "   docker-compose -f docker-compose.dev.yml logs -f backend"
echo "   docker-compose -f docker-compose.dev.yml logs -f webapp"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose.dev.yml down"
