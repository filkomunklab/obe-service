import express from "express";
import prisma from "../database";
import multer from "multer";
import xlsx from "xlsx";
import { parsePrerequisites } from "../utils";
import { CurriculumFile } from "../../global";

const upload = multer();

const RouterCurriculum = express.Router();

RouterCurriculum.get("/", async (req, res) => {
  res.json({
    status: true,
    message: "pong",
  });
});

RouterCurriculum.post(
  "/",
  upload.single("curriculumFile"),
  async (req, res) => {
    const { major, year, headOfProgramStudyId } = req.body;
    const file = req.file;

    const workbook = xlsx.read(file.buffer);
    const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    const parsedData: CurriculumFile[] = data.map((row: any) => ({
      code: row.code,
      indonesiaName: row.indonesiaName,
      englishName: row.englishName,
      credits: parseInt(row.credits),
      type: row.type,
      prerequisite: parsePrerequisites(row.prerequisite),
      semester: parseInt(row.semester),
    }));

    const createCurriculum = await prisma.$transaction(async (prisma) => {
      const curriculum = await prisma.curriculum.create({
        data: {
          major,
          year,
          headOfProgramStudyId,
        },
      });

      const subjectPayload = parsedData.map((subject) => {
        const { prerequisite, semester, ...rest } = subject;
        return rest;
      });

      await prisma.subject.createMany({
        data: subjectPayload,
      });

      const subjects = await prisma.subject.findMany({
        where: {
          code: {
            in: parsedData.map((subject) => subject.code),
          },
        },
        select: {
          id: true,
          code: true,
        },
      });

      await prisma.curriculum_Subject.createMany({
        data: subjects.map((subject) => ({
          curriculumId: curriculum.id,
          subjectId: subject.id,
          semester: parsedData.find((data) => data.code === subject.code)
            .semester,
        })),
      });

      return await prisma.curriculum.findUnique({
        where: {
          id: curriculum.id,
        },
        include: {
          Curriculum_Subject: {
            include: {
              subject: true,
            },
          },
        },
      });
    });

    res.json({
      createCurriculum,
    });
  }
);

export default RouterCurriculum;
