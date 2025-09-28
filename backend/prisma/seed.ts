import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a default group
  const defaultGroup = await prisma.group.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Fun Friday Group',
      description: 'A fun group for Friday activities and discussions',
      created_by: null
    }
  });

  console.log('✅ Default group created:', defaultGroup.name);

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: {
        username: 'john_doe',
        email: 'john@example.com',
        password: hashedPassword,
        is_anonymous: false
      }
    }),
    prisma.user.upsert({
      where: { email: 'jane@example.com' },
      update: {},
      create: {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: hashedPassword,
        is_anonymous: false
      }
    }),
    prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        username: 'bob_wilson',
        email: 'bob@example.com',
        password: hashedPassword,
        is_anonymous: false
      }
    })
  ]);

  console.log('✅ Sample users created:', users.length);

  // Add users to the default group
  await Promise.all(
    users.map(user =>
      prisma.groupMember.upsert({
        where: {
          group_id_user_id: {
            group_id: 1,
            user_id: user.id
          }
        },
        update: {},
        create: {
          group_id: 1,
          user_id: user.id
        }
      })
    )
  );

  console.log('✅ Users added to default group');

  // Create sample messages
  const sampleMessages = [
    {
      group_id: 1,
      user_id: users[0].id,
      content: "Hello everyone! Welcome to Fun Friday Group! 🎉",
      is_anonymous: false
    },
    {
      group_id: 1,
      user_id: users[1].id,
      content: "Hi there! Excited to be part of this group!",
      is_anonymous: false
    },
    {
      group_id: 1,
      user_id: users[2].id,
      content: "This is going to be fun! 🚀",
      is_anonymous: true
    },
    {
      group_id: 1,
      user_id: users[0].id,
      content: "Let's plan some activities for this Friday!",
      is_anonymous: false
    }
  ];

  await Promise.all(
    sampleMessages.map(message =>
      prisma.message.create({
        data: message
      })
    )
  );

  console.log('✅ Sample messages created');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
