import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kooki.fr' },
    update: {},
    create: {
      email: 'admin@kooki.fr',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'Kooki',
      role: UserRole.ADMIN,
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // Create a test personal user
  const userPasswordHash = await bcrypt.hash('user123456', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'user@test.fr' },
    update: {},
    create: {
      email: 'user@test.fr',
      passwordHash: userPasswordHash,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: UserRole.PERSONAL,
    },
  });
  console.log(`Test user created: ${testUser.email}`);

  // Create a test org admin user
  const orgAdminPasswordHash = await bcrypt.hash('orgadmin123456', 12);
  const orgAdmin = await prisma.user.upsert({
    where: { email: 'asso@test.fr' },
    update: {},
    create: {
      email: 'asso@test.fr',
      passwordHash: orgAdminPasswordHash,
      firstName: 'Marie',
      lastName: 'Association',
      role: UserRole.ORG_ADMIN,
    },
  });
  console.log(`Org admin user created: ${orgAdmin.email}`);

  // Create a test organization for the org admin
  const org = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      ownerUserId: orgAdmin.id,
      legalName: 'Association Test',
      email: 'asso@test.fr',
      siret: '12345678901234',
      address: '1 rue de la Paix, 75001 Paris',
      isTaxEligible: true,
    },
  });
  console.log(`Test organization created: ${org.legalName}`);

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
