import { afterAll, describe, expect, it, beforeAll } from "bun:test";
import {
  clearDatabase,
  createRpsData,
  generateXlsx,
  populateDatabase,
} from "./helpers";
import app from "../src/app";
import prisma from "../src/database";
import { faker } from "@faker-js/faker";
import { unlink } from "node:fs/promises";
import { sign } from "hono/jwt";
import Config from "../src/config";

let token: string;
let teacherId: string;
let rpsId: string;
let rpsIdWithNoStudent: string;
let gradingSystemId: string;
const pathStudent = `./tests/testFiles/ClassMember-${new Date().getTime()}.xlsx`;
const pathGrade = `./tests/testFiles/InsertGrade-${new Date().getTime()}.xlsx`;

beforeAll(async () => {
  try {
    const { kaprodi, students, employees } = await populateDatabase();
    teacherId = employees[0].id;

    token = await sign(
      {
        user: {
          id: kaprodi.id,
          nik: kaprodi.nik,
          name: `${kaprodi.firstName} ${kaprodi.lastName}`,
          role: kaprodi.role.map((item) => item.role),
        },
      },
      Config.SECRET_KEY
    );
    await prisma.employee.update({
      where: { id: kaprodi.id },
      data: { token },
    });

    // Create new curriculum
    const path = "./tests/testFiles/Kurikulum FILKOM IF 2023 - example.xlsx";
    const file = Bun.file(path);
    let formData = new FormData();
    formData.append("major", "IF");
    formData.append("year", "2023");
    formData.append("headOfProgramStudyId", kaprodi.id);
    formData.append("curriculumFile", file);
    const curriculum = await app.request("/api/curriculum", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await curriculum.json();
    const curriculumId = data.data.id;

    // get subject
    const subjects = await prisma.subject.findMany({
      take: 1,
      skip: 20,
    });
    const subjectId = subjects[0]?.id;

    // Create new cpl
    const pathCpl = "./tests/testFiles/Curriculum Cpl IF - example.xlsx";
    const fileCpl = Bun.file(pathCpl);
    const formDataCpl = new FormData();
    formDataCpl.append("file", fileCpl);
    await app.request(`/api/curriculum/${curriculumId}/cpl`, {
      body: formDataCpl,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const cpls = await prisma.cpl.findMany({
      where: {
        curriculumId,
      },
      take: 3,
    });
    const supportedCplIds = cpls.map((cpl) => cpl.id);

    // create RPS
    const body = JSON.stringify(
      createRpsData(teacherId, subjectId, supportedCplIds)
    );
    const resRps = await app.request("/api/rps", {
      method: "POST",
      body,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const rps = await resRps.json();
    gradingSystemId = rps.data.CpmkGrading[0].GradingSystem[0].id;
    rpsId = rps.data.id;

    // other RPS
    const bodyNoStudent = JSON.stringify(
      createRpsData(teacherId, subjectId, supportedCplIds)
    );
    const resRpsNoStudent = await app.request("/api/rps", {
      method: "POST",
      body: bodyNoStudent,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const rpsNoStudent = await resRpsNoStudent.json();
    gradingSystemId = rpsNoStudent.data.CpmkGrading[0].GradingSystem[0].id;
    rpsIdWithNoStudent = rpsNoStudent.data.id;

    // add student to RPS
    const studentList = students.map((item) => ({
      nim: item.nim,
      nama: item.firstName,
    }));
    await generateXlsx(studentList, pathStudent);
    const fileStudent = Bun.file(pathStudent);
    const formDataStudent = new FormData();
    formDataStudent.append("file", fileStudent);
    await app.request(`/api/rps/${rpsId}/member`, {
      method: "POST",
      body: formDataStudent,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // submit student grade
    const studentGrade = students.map((item) => ({
      nim: item.nim,
      name: item.firstName,
      grade: faker.number.int({ min: 50, max: 100 }),
    }));
    await generateXlsx(studentGrade, pathGrade);
    const fileGrade = Bun.file(pathGrade);
    const formDataGrade = new FormData();
    formDataGrade.append("file", fileGrade);
    await app.request(`/api/student-grade/${gradingSystemId}`, {
      method: "PUT",
      body: formDataGrade,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

afterAll(async () => {
  try {
    await clearDatabase();
    await unlink(pathStudent);
    await unlink(pathGrade);
  } catch (error) {
    console.log(error);
  }
});

describe("PUT /api/report-detail/:rpsId", () => {
  it("should return 404 when the target RPS not found", async () => {
    const res = await app.request(`/api/report-detail/${rpsId}-not-found`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(404);
  });

  it("should return 404 when students not found", async () => {
    const res = await app.request(`/api/report-detail/${rpsIdWithNoStudent}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(404);
  });

  it("should return 200", async () => {
    const res = await app.request(`/api/report-detail/${rpsId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(200);
  });
});

describe("GET /api/report-detail/:rpdId", () => {
  it("should return 404 if the RPS not found", async () => {
    const res = await app.request(`/api/report-detail/${rpsId}-not-found`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(404);
  });
  it("should return 200", async () => {
    const res = await app.request(`/api/report-detail/${rpsId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(200);
  });
});
