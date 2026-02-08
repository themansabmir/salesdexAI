#!/bin/bash

# Webhook Testing Script for Salesdex Document Processing
# This script helps test the MinIO webhook configuration

set -e

# Configuration
WEBHOOK_SECRET=${WEBHOOK_SECRET:-"dev-webhook-secret-change-in-production"}
WEBHOOK_ENDPOINT=${WEBHOOK_ENDPOINT:-"http://localhost:3000/documents/upload/confirm"}
DOCUMENT_ID=${DOCUMENT_ID:-"test-doc-$(date +%s)"}

echo "🧪 Testing Salesdex Webhook Configuration"
echo "======================================"
echo "Webhook Endpoint: $WEBHOOK_ENDPOINT"
echo "Document ID: $DOCUMENT_ID"
echo ""

# Function to generate HMAC signature
generate_signature() {
    local payload="$1"
    local timestamp="$2"
    local secret="$3"
    
    echo -n "${timestamp}.${payload}" | openssl dgst -sha256 -hmac "$secret" -binary | xxd -p
}

# Function to test webhook
test_webhook() {
    local document_id="$1"
    
    echo "📤 Testing webhook with document ID: $document_id"
    
    # Create payload
    local payload="{\"documentId\":\"$document_id\"}"
    local timestamp=$(date +%s)000
    
    # Generate signature
    local signature=$(generate_signature "$payload" "$timestamp" "$WEBHOOK_SECRET")
    
    echo "🔐 Generated signature: $signature"
    echo "⏰ Timestamp: $timestamp"
    echo ""
    
    # Send webhook
    echo "📡 Sending webhook request..."
    local response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "x-webhook-signature: $signature" \
        -H "x-webhook-timestamp: $timestamp" \
        -d "$payload" \
        "$WEBHOOK_ENDPOINT")
    
    # Extract status code
    local http_code=$(echo "$response" | grep -o 'HTTP_STATUS:[0-9]*' | cut -d: -f2)
    local body=$(echo "$response" | sed -e 's/HTTP_STATUS:[0-9]*$//')
    
    echo "📊 Response Status: $http_code"
    echo "📄 Response Body:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
    echo ""
    
    if [ "$http_code" = "200" ]; then
        echo "✅ Webhook test successful!"
    else
        echo "❌ Webhook test failed!"
        return 1
    fi
}

# Function to test MinIO webhook configuration
test_minio_webhook() {
    echo "🔍 Checking MinIO webhook configuration..."
    
    if command -v mc &> /dev/null; then
        # List webhook configurations
        mc admin config get local notify_webhook 2>/dev/null || echo "No webhooks configured"
        echo ""
        
        # List event configurations
        mc event list local 2>/dev/null || echo "No events configured"
        echo ""
    else
        echo "⚠️  MinIO client (mc) not found. Install it to check webhook configuration."
        echo "   Download: https://dl.min.io/client/mc/release/linux-amd64/mc"
        echo ""
    fi
}

# Function to simulate file upload
simulate_upload() {
    local document_id="$1"
    local test_file="/tmp/test-document-${document_id}.txt"
    
    echo "📁 Creating test file: $test_file"
    echo "This is a test document for webhook testing." > "$test_file"
    
    echo "📤 Simulating upload to MinIO..."
    
    if command -v mc &> /dev/null; then
        # Upload file to trigger webhook
        mc cp "$test_file" local/uploads/ || echo "Failed to upload to MinIO"
        echo "✅ File uploaded. Webhook should be triggered automatically."
    else
        echo "⚠️  Cannot simulate upload without MinIO client."
    fi
    
    # Cleanup
    rm -f "$test_file"
}

# Main execution
case "${1:-test}" in
    "test")
        test_webhook "$DOCUMENT_ID"
        ;;
    "config")
        test_minio_webhook
        ;;
    "upload")
        simulate_upload "$DOCUMENT_ID"
        ;;
    "all")
        test_minio_webhook
        echo ""
        test_webhook "$DOCUMENT_ID"
        echo ""
        simulate_upload "$DOCUMENT_ID"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  test    - Test webhook with manual request (default)"
        echo "  config  - Check MinIO webhook configuration"
        echo "  upload  - Simulate file upload to trigger webhook"
        echo "  all     - Run all tests"
        echo "  help    - Show this help"
        echo ""
        echo "Environment Variables:"
        echo "  WEBHOOK_SECRET    - Webhook secret for HMAC signing"
        echo "  WEBHOOK_ENDPOINT   - Webhook endpoint URL"
        echo "  DOCUMENT_ID        - Test document ID"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use '$0 help' for usage information."
        exit 1
        ;;
esac
