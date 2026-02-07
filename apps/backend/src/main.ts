import { createApp } from '@/app';
import { config } from '@/config';
import { connectDatabase } from '@/lib/prisma';

const bootstrap = async () => {
    try {
        await connectDatabase();
        const app = createApp();

        app.listen(config.PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${config.PORT}`);
        });
    } catch (error) {
        console.error('💥 Error starting server:', error);
        process.exit(1);
    }
};

bootstrap();
