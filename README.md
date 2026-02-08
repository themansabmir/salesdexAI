# Salesdex - Clean Docker Setup

## 🚀 Quick Start

1. **Update your DATABASE_URL in `.env`**
2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

## 📱 Access Points

- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin123)
- **Backend API**: http://localhost:3000
- **Webapp**: http://localhost:3001

## 🔄 Webhook Testing

### Test the webhook manually:
```bash
# Generate webhook signature
WEBHOOK_SECRET="dev-webhook-secret-change-in-production"
PAYLOAD='{"documentId":"test-doc-123"}'
TIMESTAMP=$(date +%s)000
SIGNATURE=$(echo -n "${TIMESTAMP}.${PAYLOAD}" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -binary | xxd -p)

# Test webhook
curl -X POST http://localhost:3000/documents/upload/confirm \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: $SIGNATURE" \
  -H "x-webhook-timestamp: $TIMESTAMP" \
  -d "$PAYLOAD"
```

### Test with file upload:
1. Upload a file through the webapp
2. Check backend logs: `docker-compose logs -f backend`
3. Look for webhook processing logs

## 🛠️ Environment Variables

Update `.env` with your actual values:

```env
DATABASE_URL=postgresql://username:password@your-aws-postgres.rds.amazonaws.com:5432/salesdex
WEBHOOK_SECRET=your-secure-webhook-secret
JWT_SECRET=your-secure-jwt-secret
```

## 📝 Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild services
docker-compose up -d --build
```

## 🎯 What This Setup Includes

- **MinIO**: Object storage with automatic webhook configuration
- **Backend**: API server (connects to your AWS PostgreSQL)
- **Webapp**: Frontend application
- **Webhooks**: Automatically configured for document processing

## 🔧 Webhook Configuration

MinIO automatically configures webhooks for:
- **Buckets**: `documents`, `uploads`, `competitors`
- **File types**: `.pdf`, `.docx`, `.txt`, `.md`
- **Endpoint**: `/documents/upload/confirm`
- **Authentication**: HMAC-SHA256 with your webhook secret

## 🚨 Important Notes

- **No PostgreSQL**: Uses your external AWS database
- **Production**: Change default passwords and secrets
- **Webhook URL**: Uses `host.docker.internal` for Docker networking
- **File Processing**: Automatic via MinIO webhooks
