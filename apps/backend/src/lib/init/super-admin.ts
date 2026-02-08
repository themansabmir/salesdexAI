import { prisma } from '@/lib/prisma';
import { BcryptHasher } from '@/lib/crypto/bcrypt-hasher.service';

export const ensureSuperAdmin = async (): Promise<void> => {
    const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@salesdex.com';
    const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123';

    const existingAdmin = await prisma.user.findFirst({
        where: { platformRole: 'SUPER_ADMIN' },
    });

    if (existingAdmin) {
        console.log('✅ Super admin already exists');
        return;
    }

    const passwordHasher = new BcryptHasher();
    const hashedPassword = await passwordHasher.hash(SUPER_ADMIN_PASSWORD);

    await prisma.user.create({
        data: {
            email: SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            clerkId: `custom_superadmin_${Date.now()}`,
            platformRole: 'SUPER_ADMIN',
            firstName: 'Super',
            lastName: 'Admin',
        },
    });

    console.log(`✅ Super admin created: ${SUPER_ADMIN_EMAIL}`);
};
