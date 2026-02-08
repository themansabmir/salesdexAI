import crypto from 'crypto';

/**
 * Utility for generating webhook authentication headers for testing
 */
export class WebhookTestHelper {
    /**
     * Generate webhook headers for testing the confirmUpload endpoint
     * @param payload The request body
     * @param secret The webhook secret (defaults to the development secret)
     * @returns Object with headers to include in your request
     */
    static generateWebhookHeaders(payload: any, secret: string = 'default-webhook-secret-change-in-production') {
        const timestamp = Date.now().toString();
        const payloadString = JSON.stringify(payload);
        
        // Create signature
        const signature = crypto
            .createHmac('sha256', secret)
            .update(`${timestamp}.${payloadString}`)
            .digest('hex');

        return {
            'x-webhook-signature': signature,
            'x-webhook-timestamp': timestamp,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Example usage for testing the confirmUpload endpoint
     */
    static getExampleRequest() {
        const payload = { documentId: 'test-document-id-123' };
        const headers = this.generateWebhookHeaders(payload);
        
        return {
            method: 'POST',
            url: '/documents/upload/confirm',
            headers,
            body: payload
        };
    }
}

// Example for curl testing:
/*
curl -X POST http://localhost:3000/documents/upload/confirm \
  -H "x-webhook-signature: $(node -e "
    const crypto = require('crypto');
    const payload = JSON.stringify({documentId: 'test-doc-123'});
    const timestamp = Date.now().toString();
    const secret = 'default-webhook-secret-change-in-production';
    const signature = crypto.createHmac('sha256', secret).update(timestamp + '.' + payload).digest('hex');
    console.log(signature);
  ")" \
  -H "x-webhook-timestamp: $(date +%s)000" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "test-doc-123"}'
*/
