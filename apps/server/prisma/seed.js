const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const existing = await prisma.channel.findFirst({ where: { kind: 'GLOBAL' } });
    if (!existing) {
      const ch = await prisma.channel.create({ data: { kind: 'GLOBAL' } });
      console.log('Created GLOBAL channel:', ch.id);
    } else {
      console.log('GLOBAL channel exists:', existing.id);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
