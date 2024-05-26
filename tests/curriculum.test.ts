import { describe, it, expect, beforeAll } from "bun:test";
import app from "../src/app";
import prisma from "../src/database";

beforeAll(async () => {
  try {
    await prisma.curriculum_Subject.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.curriculum.deleteMany();
  } catch (error) {
    console.log(error);
  }
});

describe("POST /api/curriculum", async () => {
  const path = "./tests/testFiles/Kurikulum FILKOM IF 2023 - example.xlsx";
  const file = Bun.file(path);

  it("should return 201 when curriculum is created", async () => {
    let formData = new FormData();
    formData.append("major", "IF");
    formData.append("year", "2020");
    formData.append(
      "headOfProgramStudyId",
      "fb990cd6-1318-4232-97b1-88c0f3b20e6d"
    );
    formData.append("curriculumFile", file);

    const res = await app.request("/api/curriculum", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMDliOTFmZjQtMGY0My00ZjU0LWE2ODctZWIwZGRlZTA5YjA3IiwibmlrIjoiMTEwNjA2MDExNTUiLCJuYW1lIjoiQW5kcmV3IFRhbm55ICBMaWVtIiwicm9sZSI6WyJERUtBTiJdfSwiaWF0IjoxNzE2NjgyMjY3fQ.M5GIsprqN76szJueWQTluJakZpKOEhoEPU73rY3qjgc`,
      },
    });
    expect(res.status).toBe(201);
  });
});
