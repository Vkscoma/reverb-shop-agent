// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.escalation.deleteMany();
  await prisma.listingRule.deleteMany();

  await prisma.listingRule.createMany({
    data: [
      { listingId: "demo-fender-tele", name: "Standard Telecaster offer rule", floorPrice: 85000, targetPrice: 100000 },
      { listingId: "demo-moog-sub37", name: "Moog Sub 37 offer rule", floorPrice: 95000, targetPrice: 115000 },
    ],
  });

  await prisma.escalation.create({
    data: {
      conversationId: "demo-conversation-001",
      listingId: "demo-fender-tele",
      intent: "spec_question",
      message: "Can you confirm whether the original case is included?",
      status: "open",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
