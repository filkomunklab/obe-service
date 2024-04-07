import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.assessmentIndicator.createMany({
    data: [
      {
        description: "Sangat Baik",
        letter: "A",
        minScore: 85,
        maxScore: 100,
      },
      {
        description: "Baik",
        letter: "B",
        minScore: 70,
        maxScore: 84,
      },
      {
        description: "Cukup",
        letter: "C",
        minScore: 60,
        maxScore: 69,
      },
      {
        description: "Kurang",
        letter: "D",
        minScore: 50,
        maxScore: 59,
      },
      {
        description: "Sangat Kurang",
        letter: "E",
        minScore: 0,
        maxScore: 49,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch(async (e) => {
    console.log(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
