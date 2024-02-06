import express, { Router } from "express";
import prisma from "../database";
import multer from "multer";
import { extractXlsx, parsePrerequisites } from "../utils";
import { Cpl, CurriculumFile } from "../../global";

const upload = multer();

const RouterCurriculum = express.Router();

// post Curriculum
RouterCurriculum.post(
  "/",
  upload.single("curriculumFile"),
  async (req, res) => {
    const { major, year, headOfProgramStudyId } = req.body;
    const file = req.file;

    const data = extractXlsx(file);
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

// post Curriculum Cpl
RouterCurriculum.post(
  "/:id/cpl",
  upload.single("curriculumCpl"),
  async (req, res) => {
    const { id } = req.params;
    const file = req.file;

    const data = extractXlsx(file);
    const parsedData: Cpl[] = data.map((row: any) => ({
      code: row.code,
      description: row.description,
      curriculumId: id,
    }));

    const result = await prisma.$transaction(async (prisma) => {
      await prisma.cpl.createMany({
        data: parsedData,
      });
      return await prisma.cpl.findMany({
        where: {
          curriculumId: id,
        },
      });
    });

    res.status(201).send(result);
  }
);

RouterCurriculum.get("/", async (req, res) => {
  try {
    const { major } = req.query;
    const data = await prisma.curriculum.findMany({
      where: {
        major: (major as string) || undefined,
      },
      select: {
        id: true,
        major: true,
        year: true,
        headOfProgramStudy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            Curriculum_Subject: true,
          },
        },
      },
    });

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Data not found",
      });
    }

    res.json({
      status: true,
      message: "Data retrieved",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
});

RouterCurriculum.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.curriculum.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        major: true,
        year: true,
        Curriculum_Subject: {
          select: {
            subject: {
              select: {
                id: true,
                code: true,
                englishName: true,
                indonesiaName: true,
                Subject_Cpl: {
                  select: {
                    cpl: {
                      select: {
                        code: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        message: "Data not found",
      });
    }

    res.json({
      status: true,
      message: "Data retrieved",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
});

export default RouterCurriculum;
