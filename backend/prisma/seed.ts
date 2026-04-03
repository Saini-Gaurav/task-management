import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash('Demo@1234', 12);
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@taskflow.dev',
      password: hashedPassword,
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Create sample tasks
  const tasks = await prisma.task.createMany({
    data: [
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment to production.',
        status: 'COMPLETED',
        priority: 'HIGH',
        userId: user.id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Design system documentation',
        description: 'Document all reusable components, color tokens, and typography guidelines.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        userId: user.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Write unit tests for auth module',
        description: 'Cover register, login, token refresh, and logout with Jest.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        userId: user.id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Optimize database queries',
        description: 'Add indexes to frequently queried fields and review N+1 query patterns.',
        status: 'PENDING',
        priority: 'HIGH',
        userId: user.id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Implement email notifications',
        description: 'Send email reminders for tasks due within 24 hours using nodemailer.',
        status: 'PENDING',
        priority: 'MEDIUM',
        userId: user.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'API rate limiting',
        description: 'Add express-rate-limit middleware to prevent abuse on auth endpoints.',
        status: 'PENDING',
        priority: 'MEDIUM',
        userId: user.id,
      },
      {
        title: 'Mobile responsive testing',
        description: 'Test the dashboard on iPhone SE, Pixel 5, and iPad Mini screen sizes.',
        status: 'PENDING',
        priority: 'LOW',
        userId: user.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Update README with API docs',
        description: 'Add request/response examples for all endpoints with curl commands.',
        status: 'COMPLETED',
        priority: 'LOW',
        userId: user.id,
      },
      {
        title: 'Add pagination to task list',
        description: 'Implement cursor-based pagination as an alternative to offset pagination.',
        status: 'PENDING',
        priority: 'LOW',
        userId: user.id,
      },
      {
        title: 'Security audit',
        description: 'Run npm audit, check for XSS vulnerabilities, and review JWT secret strength.',
        status: 'PENDING',
        priority: 'HIGH',
        userId: user.id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log(`✅ Created ${tasks.count} tasks`);
  console.log('\n🎉 Seed complete!');
  console.log('   Email:    demo@taskflow.dev');
  console.log('   Password: Demo@1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });