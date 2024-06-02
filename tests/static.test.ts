import { describe, it, expect } from "bun:test";
import app from "../src/app";

describe("GET /static/tempaltes/*", () => {
  const conditions = [
    "ClassMember.xlsx",
    "Curriculum.xlsx",
    "CurriculumCpl.xlsx",
    "InsertGrade.xlsx",
  ];
  it.each(conditions)("should return a file", async (file) => {
    const res = await app.request(`/static/templates/${file}`);
    const data = await res.blob();
    expect(res.status).toBe(200);
    expect(data).toBeInstanceOf(Blob);
  });

  it("should return 404", async () => {
    const res = await app.request("/static/templates/NotFound.xlsx");
    expect(res.status).toBe(404);
  });
});
