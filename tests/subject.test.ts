import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import app from "../src/app";
import prisma from "../src/database";
import { clearDatabase, populateDatabase } from "./helpers";
import Config from "../src/config";
import { sign } from "hono/jwt";

let token: string;
let targetSubject: string;
let headOfProgramStudyId: string;
let cpl: {
  id: string;
  code: string;
  description: string;
  curriculumId: string;
  createdAt: Date;
  updatedAt: Date;
}[];

beforeAll(async () => {
  try {
    // Clear all data
    const entity = await populateDatabase();

    // simulate login
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

    // Create new curriculum
    const path = "./tests/testFiles/Kurikulum FILKOM IF 2023 - example.xlsx";
    const file = Bun.file(path);
    let formData = new FormData();
    formData.append("major", "IF");
    formData.append("year", "2021");
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
    cpl = await prisma.cpl.findMany({
      where: {
        curriculumId,
      },
      take: 3,
    });
  } catch (error) {
    console.log(error);
  }
});

afterAll(async () => {
  try {
    await clearDatabase();
  } catch (error) {
    console.log(error);
  }
});

describe("GET /api/subject", async () => {
  it.skip("should return 404 when no subject exists", async () => {
    const res = await app.request("/api/subject", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(404);
  });

  it("should return 200", async () => {
    const res = await app.request("/api/subject", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("data", expect.any(Array));
    targetSubject = data.data[0].id;
  });
});

describe("GET /api/subject/:id/cpl", () => {
  it("should return 404 the target subject didn't exist", async () => {
    const res = await app.request(
      `/api/subject/${targetSubject}-not-exist/cpl`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    expect(res.status).toBe(404);
  });

  it("should return 200", async () => {
    const res = await app.request(`/api/subject/${targetSubject}/cpl`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(200);
  });
});

describe("GET /api/subject/:id/prerequisite", () => {
  it("shuld return 200", async () => {
    const res = await app.request(
      `/api/subject/${targetSubject}/prerequisite`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    expect(res.status).toBe(200);
  });

  it("should return 404 the target subject didn't exist", async () => {
    const res = await app.request(
      `/api/subject/${targetSubject}-not-exist/prerequisite`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/subject/:id/cpl-mapping", () => {
  const conditions = [{ cplIds: [0, 1, 2, 3] }, { cplIds: [] }, {}];
  it.each(conditions)("should return 400", async () => {
    const body = JSON.stringify(conditions);
    const res = await app.request(`/api/subject/${targetSubject}/cpl-mapping`, {
      method: "PUT",
      body,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    expect(res.status).toBe(400);
  });

  it('should return 404 when the target subject didn"t exist', async () => {
    const body = JSON.stringify({
      cplIds: cpl.map((item) => item.id),
    });
    const res = await app.request(
      `/api/subject/${targetSubject}-not-exist/cpl-mapping`,
      {
        method: "PUT",
        body,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    expect(res.status).toBe(404);
  });

  it("should return 201", async () => {
    const body = JSON.stringify({
      cplIds: cpl.map((item) => item.id),
    });
    const res = await app.request(`/api/subject/${targetSubject}/cpl-mapping`, {
      method: "PUT",
      body,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data).toHaveProperty("data.Subject_Cpl", expect.any(Array));
  });

  it.skip("should return 409 when the cpl already mapped to the subject", async () => {
    const body = JSON.stringify({
      cplIds: cpl.map((item) => item.id),
    });
    const res = await app.request(`/api/subject/${targetSubject}/cpl-mapping`, {
      method: "PUT",
      body,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    expect(res.status).toBe(409);
  });
});

describe("GET /api/subject/:id/cpl-mapping", () => {
  it("should return 404 when the target subject didn'nt exist", async () => {
    const res = await app.request(
      `/api/subject/${targetSubject}-not-exist/cpl-mapping`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    expect(res.status).toBe(404);
  });

  it("should return 200", async () => {
    const res = await app.request(`/api/subject/${targetSubject}/cpl-mapping`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("data.id", expect.any(String));
  });
});
