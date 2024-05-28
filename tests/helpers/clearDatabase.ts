import prisma from "../../src/database";

export default async function clearDatabase() {
  return await prisma.$transaction([
    prisma.curriculum_Subject.deleteMany(),
    prisma.subject_Cpl.deleteMany(),
    prisma.cpl.deleteMany(),
    prisma.rps.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.curriculum.deleteMany(),
  ]);
}
