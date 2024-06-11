import { afterAll, describe, it, expect, beforeAll } from "bun:test";
import {
  clearDatabase,
  createRpsData,
  generateXlsx,
  populateDatabase,
} from "./helpers";
import app from "../src/app";
import prisma from "../src/database";
import { sign } from "hono/jwt";
import Config from "../src/config";
import { unlink } from "node:fs/promises";
import { faker } from "@faker-js/faker";

let token: string;
let teacherId: string;
let rpsId: string;
let gradingSystemId: string;
let headOfProgramStudyId: string;
const studentNameFile = "tests/temp/studentdata.xlsx";

beforeAll(async () => {
  try {
    const entity = await populateDatabase();
    token = await sign(
      {
        user: {
          id: entity.kaprodi.id,
          nik: entity.kaprodi.nik,
          name: `${entity.kaprodi.firstName} ${entity.kaprodi.lastName}`,
          role: entity.kaprodi.role.map((item) => item.role),
        },
      },
      Config.SECRET_KEY
    );
    await prisma.employee.update({
      where: { id: entity.kaprodi.id },
      data: { token },
    });
    headOfProgramStudyId = entity.kaprodi.id;
    teacherId = entity.employees[0].id;

    // generate student grade
    const dataArray = entity.students.map((item) => ({
      nim: item.nim,
      name: item.firstName,
      grade: faker.number.int({ min: 50, max: 100 }),
    }));
    generateXlsx(dataArray, studentNameFile);

    // Create new curriculum
    const path = "./tests/testFiles/Kurikulum FILKOM IF 2023 - example.xlsx";
    const file = Bun.file(path);
    let formData = new FormData();
    formData.append("major", "IF");
    formData.append("year", "2023");
    formData.append("headOfProgramStudyId", headOfProgramStudyId);
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
      createRpsData({
        subjectId: subjectId,
        teacherId: teacherId,
        supportedCplIds: supportedCplIds,
      })
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

    // add student to RPS
    const pathStudent = "./tests/testFiles/ClassMember - example.xlsx";
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
  } catch (error) {
    console.log(error);
  }
});

afterAll(async () => {
  try {
    await clearDatabase();
    await unlink("tests/temp/studentdata.xlsx");
  } catch (error) {
    console.log(error);
  }
});

describe("PUT /api/student-grade/:gradingSystemId", () => {
  const file = Bun.file(studentNameFile);
  it("should return 404 when the grading system not found", async () => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await app.request(
      `/api/student-grade/${gradingSystemId}-not-found`,
      {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    expect(res.status).toBe(404);
  });

  const conditions = [
    { file: Bun.file("./tests/testFiles/Curriculum Cpl IF - example.xlsx") },
    { file: "" },
    {},
  ];
  it.each(conditions)(
    "should return 400 when the file is invalid",
    async (data) => {
      const formData = new FormData();
      data.file && formData.append("file", data.file);
      const res = await app.request(
        `/api/student-grade/${gradingSystemId}-not-found`,
        {
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(res.status).toBe(400);
    }
  );

  it("should return 404 when unkown student is on the list", async () => {
    const path =
      "./tests/testFiles/Insert Grade - example(unknown-student).xlsx";
    const file = Bun.file(path);
    const formData = new FormData();
    formData.append("file", file);
    const res = await app.request(`/api/student-grade/${gradingSystemId}`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(404);
  });

  it("should return 200", async () => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await app.request(`/api/student-grade/${gradingSystemId}`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(200);
  });
});
