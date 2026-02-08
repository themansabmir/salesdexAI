import { PrismaClient } from '@prisma/client';

// Define the transaction client type
type PrismaTransactionClient = Omit<
    PrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

/**
 * Utility class for database transactions with proper error handling
 */
export class DatabaseTransaction {
    constructor(private readonly prisma: PrismaClient) {}

    /**
     * Execute a function within a database transaction
     * @param operation - The operation to execute within the transaction
     * @returns Promise with the result of the operation
     */
    async execute<T>(operation: (tx: PrismaTransactionClient) => Promise<T>): Promise<T> {
        try {
            return await this.prisma.$transaction(operation);
        } catch (error) {
            // Log the error for debugging
            console.error('Database transaction failed:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: new Date().toISOString(),
            });
            
            // Re-throw the error for the caller to handle
            throw error;
        }
    }

    /**
     * Execute multiple operations sequentially in a transaction with retry logic
     * @param operations - Array of operations to execute
     * @param maxRetries - Maximum number of retry attempts
     * @returns Promise with the results of all operations
     */
    async executeSequential<T>(
        operations: ((tx: PrismaTransactionClient) => Promise<T>)[],
        maxRetries: number = 3
    ): Promise<T[]> {
        let lastError: Error | unknown;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const results: T[] = [];
                await this.prisma.$transaction(async (tx) => {
                    for (const operation of operations) {
                        const result = await operation(tx);
                        results.push(result);
                    }
                });
                return results;
            } catch (error) {
                lastError = error;
                
                // Don't retry on certain errors
                if (error instanceof Error && this.isNonRetryableError(error)) {
                    throw error;
                }
                
                // Log retry attempt
                console.warn(`Transaction attempt ${attempt} failed, retrying...`, {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    attempt,
                    maxRetries,
                });
                
                // Exponential backoff
                if (attempt < maxRetries) {
                    await this.delay(Math.pow(2, attempt) * 100); // 100ms, 200ms, 400ms
                }
            }
        }
        
        throw lastError;
    }

    private isNonRetryableError(error: Error): boolean {
        // Don't retry on validation errors, unique constraint violations, etc.
        const nonRetryableCodes = [
            'P2002', // Unique constraint violation
            'P2003', // Foreign key constraint violation
            'P2025', // Record not found
        ];
        
        return nonRetryableCodes.some(code => error.message.includes(code));
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
