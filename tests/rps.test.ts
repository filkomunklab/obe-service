import { unlink } from "node:fs/promises";
import { afterAll, describe, it, expect, beforeAll } from "bun:test";
import prisma from "../src/database";
import app from "../src/app";
import {
  clearDatabase,
  createRpsBadConditions,
  createRpsData,
  generateXlsx,
  populateDatabase,
} from "./helpers";
import { sign } from "hono/jwt";
import Config from "../src/config";

let token: string;
let subjectId: string;
let supportedCplIds: string[];
let sameSupportedCpl: string[];
let rpsId: string;
let teacherId: string;
const filename = `tests/temp/ClassMember-${new Date().getTime()}.xlsx`;

beforeAll(async () => {
  try {
    const { kaprodi, employees, students } = await populateDatabase();
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
    // Create temp studentlist.xlsx
    const studentList = students.map((item) => ({
      nim: item.nim,
      nama: item.firstName,
    }));
    await generateXlsx(studentList, filename);

    // Create new curriculum
    const path = "./tests/testFiles/Kurikulum FILKOM IF 2023 - example.xlsx";
    const file = Bun.file(path);
    let formData = new FormData();
    formData.append("major", "IF");
    formData.append("year", "2022");
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
    subjectId = subjects[0]?.id;

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
    supportedCplIds = cpls.map((cpl) => cpl.id);
    sameSupportedCpl = cpls.map((cpl, _, array) => array[0].id);
  } catch (error) {
    console.log(error);
  }
});

afterAll(async () => {
  try {
    await clearDatabase();
    await unlink(filename);
  } catch (error) {
    console.log(error);
  }
});

describe("POST /api/rps/", () => {
  it.each(createRpsBadConditions(teacherId, subjectId, supportedCplIds))(
    "should return 400 if the body is invalid",
    async (data) => {
      const res = await app.request("/api/rps", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      expect(res.status).toBe(400);
    }
  );

  it("should return 404 if the supperted CPL didn't exist", async () => {
    const supportedCplIds = ["no-cpl"];
    const body = JSON.stringify(
      createRpsData(teacherId, subjectId, supportedCplIds)
    );
    const res = await app.request("/api/rps", {
      method: "POST",
      body,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    expect(res.status).toBe(404);
  });

  it("should return 409 if the supported CPL already exist on some CPMK", async () => {
    const body = JSON.stringify(
      createRpsData(teacherId, subjectId, sameSupportedCpl)
    );
    const res = await app.request("/api/rps", {
      method: "POST",
      body,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    expect(res.status).toBe(409);
  });

  it("should return 201", async () => {
    const body = JSON.stringify(
      createRpsData(teacherId, subjectId, supportedCplIds)
    );
    const res = await app.request("/api/rps", {
      method: "POST",
      body,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data).toHaveProperty("data.id", expect.any(String));
    rpsId = data.data.id;
  });
});

describe("GET /api/rps/:id", () => {
  it("should return 404 if the target rps didn't exist", async () => {
    const res = await app.request(`/api/rps/${rpsId}-no-rps`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(404);
  });

  it("should return 200", async () => {
    const res = await app.request(`/api/rps/${rpsId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
  });
});

describe("PATCH /api/rps/:id", () => {
  const conditions = [
    { status: "UNKOWN-VALUE" },
    { status: "" },
    { status: true },
    {},
  ];
  it.each(conditions)(
    "should return 400 when data is invalid",
    async (data) => {
      const res = await app.request(`/api/rps/${rpsId}`, {
        body: JSON.stringify(data),
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      expect(res.status).toBe(400);
    }
  );

  it("should return 404", async () => {
    const res = await app.request(`/api/rps/${rpsId}-wrong-id`, {
      body: JSON.stringify({ status: "APPROVED" }),
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    expect(res.status).toBe(404);
  });

  it("should return 200", async () => {
    const res = await app.request(`/api/rps/${rpsId}`, {
      body: JSON.stringify({ status: "APPROVED" }),
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    expect(res.status).toBe(200);
  });
});

describe("GET /api/rps/list/all", () => {
  it("should return 200", async () => {
    const res = await app.request("/api/rps/list/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("data", expect.any(Array));
  });
});

describe("GET /api/rps/list/major-summary", () => {
  it("should return 200", async () => {
    const res = await app.request("/api/rps/list/major-summary", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("data", expect.any(Array));
  });
});

describe("GET /api/rps/list/teacher/:teacherId", () => {
  it("should return 404 if the target teacher or the RPSs didn't exist", async () => {
    const res = await app.request(
      `/api/rps/list/teacher/${teacherId}-no-teacher`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    expect(res.status).toBe(404);
  });

  it("should return 200", async () => {
    const res = await app.request(`/api/rps/list/teacher/${teacherId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("data.rps", expect.any(Array));
  });
});

describe("POST /api/rps/:id/member", () => {
  const file = Bun.file(filename);

  const conditions = [
    { file: "Curriculum Cpl IF - example" },
    { file: "" },
    {},
  ];
  it.each(conditions)(
    "should return 400 if the body is invalid",
    async (data) => {
      const formData = new FormData();
      data.file && formData.append("file", data.file);
      const res = await app.request(`/api/rps/${rpsId}/member`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      expect(res.status).toBe(400);
    }
  );

  it("should return 404 if the target rps didn't exist", async () => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await app.request(`/api/rps/${rpsId}-no-rps/member`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(404);
  });

  it("should return 201", async () => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await app.request(`/api/rps/${rpsId}/member`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    expect(res.status).toBe(201);
  });

  it.skip("should return 409 if the member already exist", async () => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await app.request(`/api/rps/${rpsId}/member`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(409);
  });
});

describe("DELETE /api/rps/:id", () => {
  it("should return 404 if the target rps didn't exist", async () => {
    const res = await app.request(`/api/rps/${rpsId}-no-rps`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(404);
  });

  it("should return 200", async () => {
    const res = await app.request(`/api/rps/${rpsId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(200);
  });
});
