# Salesdex Docker Setup

This repository now provides multiple Docker configurations for different use cases.

## 🗂️ Docker Compose Files

### 1. `docker-compose.minio.yml` - MinIO Only
**Use for:** Running MinIO in isolation with webhook configuration
```bash
# Start MinIO with webhooks
docker-compose -f docker-compose.minio.yml up -d

# Load environment variables
source .env.minio
docker-compose -f docker-compose.minio.yml up -d
```

**Services:**
- `minio` - MinIO object storage with web console
- `minio-client` - Automatic bucket and webhook setup

### 2. `docker-compose.dev.yml` - Backend + Webapp (Development)
**Use for:** Local development with external MinIO
```bash
# Load development environment
source .env.dev

# Start backend and webapp
docker-compose -f docker-compose.dev.yml up -d
```

**Services:**
- `backend` - API server (connects to AWS PostgreSQL + local MinIO)
- `webapp` - Frontend application

### 3. `docker-compose.yml` - Full Stack (Legacy)
**Use for:** Complete development environment with PostgreSQL
```bash
docker-compose up -d
```

## 🚀 Quick Start

### Option 1: MinIO Only (Recommended)
```bash
# 1. Start MinIO
docker-compose -f docker-compose.minio.yml up -d

# 2. Access MinIO Console
# http://localhost:9001 (minioadmin/minioadmin123)

# 3. Start backend separately (if needed)
cd apps/backend
npm run dev
```

### Option 2: Full Development Stack
```bash
# 1. Start MinIO
docker-compose -f docker-compose.minio.yml up -d

# 2. Start backend and webapp
source .env.dev
docker-compose -f docker-compose.dev.yml up -d

# 3. Access applications
# Backend: http://localhost:3000
# Webapp: http://localhost:3001
```

## 🐳 Optimized Dockerfiles

### Backend: `apps/backend/Dockerfile.optimized`
- Multi-stage build for smaller production image
- Better layer caching
- Security-focused (non-root user)
- Health checks included

### Webapp: `apps/webapp/Dockerfile.optimized`
- Optimized for React/Vite applications
- Production-ready build process
- Static asset handling
- Health checks

## 🔧 Environment Configuration

### MinIO Environment (`.env.minio`)
```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
WEBHOOK_SECRET=dev-webhook-secret-change-in-production
```

### Development Environment (`.env.dev`)
```env
DATABASE_URL=postgresql://username:password@your-aws-postgres.rds.amazonaws.com:5432/salesdex
MINIO_ENDPOINT=localhost
WEBHOOK_SECRET=dev-webhook-secret-change-in-production
JWT_SECRET=your-super-secret-jwt-key
```

## 🌐 Network Configuration

### MinIO Webhook Setup
The MinIO webhook is configured to call:
- **Local Development**: `http://host.docker.internal:3000/documents/upload/confirm`
- **Docker Network**: `http://backend:3000/documents/upload/confirm`

### Port Mappings
- **MinIO API**: `9000:9000`
- **MinIO Console**: `9001:9001`
- **Backend**: `3000:3000`
- **Webapp**: `3001:3001`

## 📝 Usage Examples

### Start MinIO Only
```bash
docker-compose -f docker-compose.minio.yml up -d
```

### Start Development Stack
```bash
# Load environment
source .env.dev

# Start services
docker-compose -f docker-compose.dev.yml up -d
```

### View Logs
```bash
# MinIO logs
docker-compose -f docker-compose.minio.yml logs -f

# Backend logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Webapp logs
docker-compose -f docker-compose.dev.yml logs -f webapp
```

### Stop Services
```bash
docker-compose -f docker-compose.minio.yml down
docker-compose -f docker-compose.dev.yml down
```

## 🔒 Security Notes

- **Webhook Secret**: Use a strong, unique secret in production
- **Database**: Use AWS PostgreSQL with proper security groups
- **MinIO**: Change default credentials in production
- **Network**: Consider using Docker networks for isolation

## 🛠️ Troubleshooting

### MinIO Webhook Issues
```bash
# Check webhook configuration
docker-compose exec minio-client mc admin config get myminio notify_webhook

# Test webhook manually
./scripts/test-webhook.sh test
```

### Backend Connection Issues
```bash
# Check backend logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Verify environment variables
docker-compose -f docker-compose.dev.yml exec backend env | grep MINIO
```

### Port Conflicts
If ports are in use, modify the `docker-compose*.yml` files:
```yaml
ports:
  - "9010:9000"  # Change MinIO API port
  - "9011:9001"  # Change MinIO Console port
```

## 📁 File Structure
```
salesdex/
├── docker-compose.minio.yml     # MinIO only
├── docker-compose.dev.yml       # Backend + Webapp
├── docker-compose.yml           # Full stack (legacy)
├── .env.minio                   # MinIO environment
├── .env.dev                     # Development environment
├── apps/
│   ├── backend/
│   │   ├── Dockerfile           # Original
│   │   └── Dockerfile.optimized # Optimized version
│   └── webapp/
│       └── Dockerfile.optimized # Optimized version
└── scripts/
    └── test-webhook.sh          # Webhook testing
```
