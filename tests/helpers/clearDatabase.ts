import prisma from "../../src/database";

export default async function clearDatabase() {
  return await prisma.$transaction([
    prisma.studentGrade.deleteMany(),
    prisma.curriculum_Subject.deleteMany(),
    prisma.subject_Cpl.deleteMany(),
    prisma.cpl.deleteMany(),
    prisma.rps.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.curriculum.deleteMany(),
    prisma.userRole.deleteMany(),
    prisma.student.deleteMany(),
    prisma.employee.deleteMany(),
  ]);
}
