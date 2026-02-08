# MinIO Configuration for Local Development

## Quick Start

1. **Start MinIO:**
   ```bash
   docker-compose up -d minio
   ```

2. **Access MinIO Console:**
   - URL: http://localhost:9001
   - Username: `minioadmin`
   - Password: `minioadmin123`

3. **Setup Buckets and Webhooks (auto-created):**
   ```bash
   docker-compose up -d minio-client
   ```

## Environment Variables

Add these to your `.env` file in the backend:

```env
# File Upload Configuration
FILE_UPLOAD_ADAPTER=minio

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=uploads
MINIO_REGION=us-east-1

# Webhook Configuration
WEBHOOK_SECRET=your-super-secret-webhook-key-change-in-production
WEBHOOK_ENDPOINT=http://localhost:3000/documents/upload/confirm
```

## Webhook Setup

### Automatic Configuration
The MinIO client container automatically configures webhooks for document processing:

- **Document Upload Events**: Triggers on `.pdf`, `.docx`, `.txt`, `.md` files
- **Buckets**: `documents` and `uploads`
- **Endpoint**: `/documents/upload/confirm`
- **Authentication**: HMAC-SHA256 with webhook secret

### Manual Webhook Configuration
If you need to configure webhooks manually:

```bash
# Access MinIO client container
docker-compose exec minio-client sh

# Set webhook configuration
mc admin config set myminio notify_webhook:document_upload \
  endpoint=http://backend:3000/documents/upload/confirm \
  auth_token=hmac \
  secret=your-webhook-secret \
  queue_dir=/tmp/webhook-queue \
  queue_limit=1000

# Add webhook events for document bucket
mc event add myminio/documents arn:minio:sqs::webhook:document_upload \
  --suffix=.pdf \
  --suffix=.docx \
  --suffix=.txt \
  --suffix=.md \
  --event=put

# Add webhook events for uploads bucket
mc event add myminio/uploads arn:minio:sqs::webhook:document_upload \
  --suffix=.pdf \
  --suffix=.docx \
  --suffix=.txt \
  --suffix=.md \
  --event=put
```

## Webhook Testing

### Using the Test Script
```bash
# Test webhook manually
./scripts/test-webhook.sh test

# Check MinIO webhook configuration
./scripts/test-webhook.sh config

# Simulate file upload to trigger webhook
./scripts/test-webhook.sh upload

# Run all tests
./scripts/test-webhook.sh all
```

### Manual Webhook Testing
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

## Development Workflow

1. **Start services:**
   ```bash
   docker-compose up -d
   ```

2. **Check MinIO status:**
   ```bash
   docker-compose ps minio
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f minio
   docker-compose logs -f minio-client
   ```

4. **Test webhooks:**
   ```bash
   ./scripts/test-webhook.sh all
   ```

5. **Stop services:**
   ```bash
   docker-compose down
   ```

## Webhook Payload Format

MinIO sends webhooks with the following structure:

```json
{
  "eventTime": "2024-01-01T12:00:00Z",
  "eventName": "s3:ObjectCreated:Put",
  "bucket": "documents",
  "object": {
    "key": "uploaded-document.pdf",
    "size": 1024,
    "contentType": "application/pdf",
    "userMetadata": {}
  },
  "requestId": "1234567890"
}
```

Our backend extracts the document ID from the object key or uses a mapping to determine which document to process.

## Bucket Policies

- **uploads**: Public access (for serving files)
- **documents**: Private access (knowledge base)
- **competitors**: Private access (competitor data)

## Data Persistence

MinIO data is persisted in Docker volume `minio_data`. Data will survive container restarts.

## Troubleshooting

### Port Conflicts
If ports 9000/9001 are in use, modify the ports in `docker-compose.yml`:
```yaml
ports:
  - "9010:9000"  # Change to 9010
  - "9011:9001"  # Change to 9011
```

### Webhook Issues
```bash
# Check webhook configuration
docker-compose exec minio-client mc admin config get myminio notify_webhook

# Check event configuration
docker-compose exec minio-client mc event list myminio

# Test webhook manually
./scripts/test-webhook.sh test

# View webhook logs
docker-compose logs -f backend | grep webhook
```

### Reset MinIO
```bash
docker-compose down -v
docker-compose up -d
```

### Access from Backend
The backend can access MinIO at `http://minio:9000` (no SSL needed for local dev).

## Production Notes

For production:
- Use SSL/TLS
- Set strong credentials
- Configure proper bucket policies
- Use external volume or cloud storage
- Set up proper webhook retry policies
- Monitor webhook delivery
- Use environment-specific webhook secrets
