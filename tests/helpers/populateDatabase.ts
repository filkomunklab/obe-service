import { Gender, Prisma } from "@prisma/client";
import prisma from "../../src/database";
import { faker } from "@faker-js/faker";

const populateDatabase = async () => {
  // Create STUDENT
  const students = await prisma.$transaction(async (prisma) => {
    const students = await prisma.student.createManyAndReturn({
      data: studentData,
    });
    const rolesData: Prisma.UserRoleCreateManyInput[] = students.map(
      (item) => ({ userId: item.id, role: "MAHASISWA" })
    );
    await prisma.userRole.createMany({
      data: rolesData,
    });
    return students;
  });

  // Create DOSEN
  const employees = await prisma.$transaction(async (prisma) => {
    const employees = await prisma.employee.createManyAndReturn({
      data: employeeData,
    });
    const rolesData: Prisma.UserRoleCreateManyInput[] = employees.map(
      (item) => ({ userId: item.id, role: "DOSEN" })
    );
    await prisma.userRole.createMany({
      data: rolesData,
    });
    return employees;
  });

  // Create KAPRODI
  const kaprodi = await prisma.$transaction(async (prisma) => {
    const kaprodi = await prisma.employee.create({ data: kaprodiData });
    const kaprodiRole = await prisma.userRole.createManyAndReturn({
      data: [
        { userId: kaprodi.id, role: "DOSEN" },
        { userId: kaprodi.id, role: "KAPRODI" },
      ],
    });
    return { ...kaprodi, role: kaprodiRole };
  });
  return { kaprodi, employees, students };
};

const studentData: Prisma.StudentCreateManyInput[] = Array.from({
  length: 5,
}).map(() => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  nim: faker.string.numeric({ length: 12 }),
  gender: faker.person.sex().toUpperCase() as Gender,
  address: faker.location.streetAddress(),
}));

const employeeData: Prisma.EmployeeCreateManyInput[] = Array.from({
  length: 10,
}).map(() => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  nik: faker.string.numeric({ length: 12 }),
  Address: faker.location.streetAddress(),
}));

const kaprodiData: Prisma.EmployeeCreateInput = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  nik: faker.string.numeric({ length: 12 }),
  Address: faker.location.streetAddress(),
};

export default populateDatabase;
