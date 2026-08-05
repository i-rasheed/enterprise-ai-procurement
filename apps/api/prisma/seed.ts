import {
  ContractStatus,
  ContractType,
  InvoiceStatus,
  PrismaClient,
  ProcurementStatus,
  PurchaseOrderStatus,
  Role,
  VendorStatus,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('Password123!');

  const organisation = await prisma.organisation.upsert({
    where: { slug: 'demo-corp' },
    update: {},
    create: { name: 'Demo Corporation', slug: 'demo-corp' },
  });

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@demo.com' },
      update: {},
      create: {
        email: 'admin@demo.com',
        firstName: 'Demo',
        lastName: 'Admin',
        passwordHash,
        role: Role.ADMIN,
        organisationId: organisation.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'finance@demo.com' },
      update: {},
      create: {
        email: 'finance@demo.com',
        firstName: 'Finance',
        lastName: 'User',
        passwordHash,
        role: Role.FINANCE,
        organisationId: organisation.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'procurement@demo.com' },
      update: {},
      create: {
        email: 'procurement@demo.com',
        firstName: 'Procurement',
        lastName: 'Manager',
        passwordHash,
        role: Role.PROCUREMENT_MANAGER,
        organisationId: organisation.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'depthead@demo.com' },
      update: {},
      create: {
        email: 'depthead@demo.com',
        firstName: 'Department',
        lastName: 'Head',
        passwordHash,
        role: Role.DEPARTMENT_HEAD,
        organisationId: organisation.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'vendor@demo.com' },
      update: {},
      create: {
        email: 'vendor@demo.com',
        firstName: 'Vendor',
        lastName: 'User',
        passwordHash,
        role: Role.USER,
        organisationId: organisation.id,
      },
    }),
  ]);

  for (const user of users) {
    await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
  }

  const vendor = await prisma.vendor.upsert({
    where: {
      organisationId_email: {
        organisationId: organisation.id,
        email: 'contact@globex-demo.com',
      },
    },
    update: {},
    create: {
      organisationId: organisation.id,
      name: 'Globex Demo Supplies',
      email: 'contact@globex-demo.com',
      category: 'IT Hardware',
      status: VendorStatus.ACTIVE,
      registrationNumber: 'DEMO-RC-001',
    },
  });

  let procurement = await prisma.procurementRequest.findFirst({
    where: {
      organisationId: organisation.id,
      title: 'Demo Office Equipment',
    },
  });

  if (!procurement) {
    procurement = await prisma.procurementRequest.create({
      data: {
        organisationId: organisation.id,
        requesterId: users[3]!.id,
        title: 'Demo Office Equipment',
        description: 'Seed procurement request for demo laptops and monitors',
        justification: 'Replace aging equipment',
        department: 'IT',
        estimatedBudget: 50000,
        status: ProcurementStatus.APPROVED,
        requiredDeliveryDate: new Date('2026-12-31'),
        items: {
          create: [
            { description: 'Laptop', quantity: 10, unitPrice: 1200, totalPrice: 12000 },
            { description: 'Monitor', quantity: 10, unitPrice: 350, totalPrice: 3500 },
          ],
        },
      },
    });
  }

  const contract = await prisma.contract.upsert({
    where: { contractNumber: 'CTR-DEMO-000001' },
    update: {},
    create: {
      contractNumber: 'CTR-DEMO-000001',
      organisationId: organisation.id,
      vendorId: vendor.id,
      procurementRequestId: procurement.id,
      title: 'Demo IT Supply Agreement',
      description: 'Annual IT hardware supply agreement',
      contractType: ContractType.GOODS,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      value: 50000,
      status: ContractStatus.ACTIVE,
      createdById: users[0]!.id,
    },
  });

  console.log('Seed complete:', {
    organisation: organisation.slug,
    users: users.map((u) => u.email),
    vendor: vendor.name,
    procurement: procurement.title,
    contract: contract.contractNumber,
  });

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  await prisma.organisation.update({
    where: { id: organisation.id },
    data: {
      plan: 'PROFESSIONAL',
      billingStatus: 'TRIALING',
      trialEndsAt,
      billingEmail: 'admin@demo.com',
    },
  });

  await prisma.user.update({
    where: { id: users[0].id },
    data: { isPlatformAdmin: true, isVerified: true },
  });

  await prisma.emailTemplate.createMany({
    skipDuplicates: true,
    data: [
      {
        key: 'welcome',
        subject: 'Welcome to {{appName}}',
        htmlBody: '<p>Hi {{firstName}}, welcome to {{appName}}.</p>',
        textBody: 'Hi {{firstName}}, welcome to {{appName}}.',
      },
      {
        key: 'email_verification',
        subject: 'Verify your email',
        htmlBody: '<p>Verify your account: <a href="{{verifyUrl}}">Verify email</a></p>',
        textBody: 'Verify your account: {{verifyUrl}}',
      },
      {
        key: 'password_reset',
        subject: 'Reset your password',
        htmlBody: '<p>Reset password: <a href="{{resetUrl}}">Reset</a></p>',
        textBody: 'Reset password: {{resetUrl}}',
      },
      {
        key: 'invitation',
        subject: 'You are invited to {{organisationName}}',
        htmlBody: '<p>Join {{organisationName}}: <a href="{{inviteUrl}}">Accept invitation</a></p>',
        textBody: 'Join {{organisationName}}: {{inviteUrl}}',
      },
    ],
  });

  await prisma.systemSetting.createMany({
    skipDuplicates: true,
    data: [
      { key: 'maintenance_mode', value: { enabled: false } },
      { key: 'support_email', value: { address: 'support@spendwise.app' } },
      { key: 'default_trial_days', value: { days: 14 } },
    ],
  });

  await prisma.blogPost.createMany({
    skipDuplicates: true,
    data: [
      {
        slug: 'launch-multi-tenant-saas',
        title: 'Launching SpendWise as a multi-tenant SaaS',
        excerpt: 'How we added Paystack billing, usage limits, and tenant isolation.',
        content:
          'SpendWise now ships with subscription plans, Paystack checkout, feature flags, and billing management designed for enterprise procurement teams.',
        authorName: 'SpendWise Team',
        published: true,
        publishedAt: new Date(),
      },
      {
        slug: 'aws-production-deployment',
        title: 'Deploying SpendWise on AWS',
        excerpt: 'Reference architecture for ECS, RDS, Redis, and backups.',
        content:
          'Use the included Terraform modules and production runbooks to deploy API, web, and docs services with monitoring and automated backups.',
        authorName: 'SpendWise Team',
        published: true,
        publishedAt: new Date(),
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
