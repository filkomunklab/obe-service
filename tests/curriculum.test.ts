import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import app from "../src/app";
import { clearDatabase, populateDatabase } from "./helpers";
import { sign } from "hono/jwt";
import Config from "../src/config";
import prisma from "../src/database";

let curriculumId: string;
let token: string;
let headOfProgramStudyId: string;

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

describe("POST /api/curriculum", async () => {
  const path = "./tests/testFiles/Kurikulum FILKOM IF 2023 - example.xlsx";
  const file = Bun.file(path);

  it("should return 401 when user is not authenticated", async () => {
    let formData = new FormData();
    formData.append("major", "IF");
    formData.append("year", "2020");
    formData.append("headOfProgramStudyId", headOfProgramStudyId);
    formData.append("curriculumFile", file);

    const res = await app.request("/api/curriculum", {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(401);
  });

  const conditions = [
    {
      case: "no major",
      major: "",
      year: "2020",
      headOfProgramStudyId: headOfProgramStudyId,
      curriculumFile: file,
    },
    {
      case: "no year",
      major: "IF",
      year: "",
      headOfProgramStudyId: headOfProgramStudyId,
      curriculumFile: file,
    },
    {
      case: "no head of program study id",
      major: "IF",
      year: "2020",
      headOfProgramStudyId: "",
      curriculumFile: file,
    },
    {
      case: "no curriculum file",
      major: "IF",
      year: "2020",
      headOfProgramStudyId: headOfProgramStudyId,
      curriculumFile: "",
    },
    { case: "no data" },
  ];
  it.each(conditions)(`should return 400 when $case`, async (data) => {
    let formData = new FormData();
    data.major && formData.append("major", data.major);
    data.year && formData.append("year", data.year);
    data.headOfProgramStudyId &&
      formData.append("headOfProgramStudyId", data.headOfProgramStudyId);
    data.curriculumFile &&
      formData.append("curriculumFile", data.curriculumFile);

    const res = await app.request("/api/curriculum", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(400);
  });

  it("should return 400 when the xlsx file structure is not valid", async () => {
    const path = "./tests/testFiles/Curriculum Cpl IF - example.xlsx";
    const file = Bun.file(path);

    let formData = new FormData();
    formData.append("major", "IF");
    formData.append("year", "2020");
    formData.append("headOfProgramStudyId", headOfProgramStudyId);
    formData.append("curriculumFile", file);

    const res = await app.request("/api/curriculum", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.status).toBe(400);
  });

  it("should return 404 when the head of program study is not found", async () => {
    let formData = new FormData();
    formData.append("major", "IF");
    formData.append("year", "2020");
    formData.append(
      "headOfProgramStudyId",
      "fb990cd6-1318-4232-97b1-88c0f3b20e6dd"
    );
    formData.append("curriculumFile", file);

    const res = await app.request("/api/curriculum", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(404);
  });

  it("should return 201 when curriculum is created", async () => {
    let formData = new FormData();
    formData.append("major", "IF");
    formData.append("year", "2020");
    formData.append("headOfProgramStudyId", headOfProgramStudyId);
    formData.append("curriculumFile", file);

    const res = await app.request("/api/curriculum", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data).toHaveProperty("data.id");
    curriculumId = data.data.id;
  });

  it("should return 409 when same curriculum major and year already exist", async () => {
    let formData = new FormData();
    formData.append("major", "IF");
    formData.append("year", "2020");
    formData.append("headOfProgramStudyId", headOfProgramStudyId);
    formData.append("curriculumFile", file);

    const res = await app.request("/api/curriculum", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(409);
  });
});

describe("POST /api/curriculum/:id/cpl", () => {
  const path = "./tests/testFiles/Curriculum Cpl IF - example.xlsx";
  const file = Bun.file(path);

  it("should return 404 when curriculum not found", async () => {
    const formData = new FormData();
    formData.append("curriculumCpl", file);
    const res = await app.request(`/api/${curriculumId}d/cpl`, {
      body: formData,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(404);
  });

  it("should return 401 when user is not authenticated", async () => {
    const formData = new FormData();
    formData.append("curriculumCpl", file);

    const res = await app.request(`/api/curriculum/${curriculumId}/cpl`, {
      body: formData,
      method: "POST",
    });
    expect(res.status).toBe(401);
  });

  it("should return 400 when the xlsx file structure is not valid", async () => {
    const path = "./tests/testFiles/Kurikulum FILKOM IF 2023 - example.xlsx"; // wrong file
    const file = Bun.file(path);
    const formData = new FormData();
    formData.append("curriculumCpl", file);

    const res = await app.request(`/api/curriculum/${curriculumId}/cpl`, {
      body: formData,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.status).toBe(400);
  });

  const conditions = [{ curriculumCpl: "" }, {}];
  it.each(conditions)(
    "should return 400 when the data is not valid",
    async (data) => {
      const formData = new FormData();
      data.curriculumCpl &&
        formData.append("curriculumCpl", data.curriculumCpl);

      const res = await app.request(`/api/curriculum/${curriculumId}/cpl`, {
        body: formData,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(res.status).toBe(400);
    }
  );

  it("should return 201 when CPLs are created successfully", async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await app.request(`/api/curriculum/${curriculumId}/cpl`, {
      body: formData,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data).toHaveProperty("status", true);
  });

  it("should return 409 when the curriculum's CPLs already exist", async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await app.request(`/api/curriculum/${curriculumId}/cpl`, {
      body: formData,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(res.status).toBe(409);
  });
});

describe("GET /api/curriculum", async () => {
  it("should return 200 when curriculum found", async () => {
    const res = await app.request("/api/curriculum", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("data", expect.any(Array));
  });

  it.skip("should return 404 when no curriculum found", async () => {
    const res = await app.request("/api/curriculum", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/curriculum/:id", async () => {
  it("should return 404 when curriculum not found", async () => {
    const res = await app.request(`/api/curriculum/${curriculumId}d`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(404);
  });

  it("should return 200 when curriculum found", async () => {
    const res = await app.request(`/api/curriculum/${curriculumId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("data");
  });
});

describe("DELETE /api/curriculum/:id", () => {
  it("should retrun 404 when curriculum not found", async () => {
    const res = await app.request(`/api/curriculum/${curriculumId}d`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(404);
  });

  it("should return 200 when success", async () => {
    const res = await app.request(`/api/curriculum/${curriculumId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
  });
});
