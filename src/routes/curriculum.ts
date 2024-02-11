import express from "express";
import prisma from "../database";
import multer from "multer";
import { extractXlsx, parsePrerequisites } from "../utils";
import { Cpl, CurriculumFile } from "../../global";
import { validateSchema } from "../middleware";
import { createCurriculumCplSchema, createCurriculumSchema } from "../schemas";
import cplSchema from "../schemas/cplSchema";
import curriculumSchema from "../schemas/curriculumSchema";
import { ValidationError } from "yup";

const upload = multer();

const RouterCurriculum = express.Router();

// post Curriculum
RouterCurriculum.post(
  "/",
  upload.single("curriculumFile"),
  validateSchema(createCurriculumSchema),
  async (req, res) => {
    const { major, year, headOfProgramStudyId } = req.body;
    const file = req.file;

    try {
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

      await curriculumSchema.validate(parsedData, { abortEarly: false });

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
            prerequisite:
              parsedData.find((data) => data.code === subject.code)
                ?.prerequisite || [],
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

      res.status(201).json({
        status: true,
        message: "Curriculum created successfully",
        data: createCurriculum,
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          status: false,
          message: "Please provide valid xlsx data",
          error: error.inner.map((err: ValidationError) => err.message),
        });
      }

      if (error.code === "P2002") {
        return res.status(409).json({
          status: false,
          message: "Curriculum already exist",
          error,
        });
      }

      console.log(error);

      res.status(500).json({
        status: false,
        message: "Internal server error",
        error,
      });
    }
  }
);

// post Curriculum Cpl
RouterCurriculum.post(
  "/:id/cpl",
  upload.single("curriculumCpl"),
  validateSchema(createCurriculumCplSchema),
  async (req, res) => {
    const { id } = req.params;
    const file = req.file;

    try {
      const data = extractXlsx(file);
      const parsedData: Cpl[] = data.map((row: any) => ({
        code: row.code,
        description: row.description,
        curriculumId: id,
      }));

      await cplSchema.validate(parsedData, { abortEarly: false });

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

      res.status(201).send({
        status: true,
        message: "Curriculum's CPLs created successuly",
        data: result,
      });
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(409).json({
          status: false,
          message: "Curriculum's CPLs already exist",
          error,
        });
      }

      if (error.code === "P2003") {
        return res.status(404).json({
          status: false,
          message: "Curriculum not found",
          error,
        });
      }

      if (error.name === "ValidationError") {
        return res.status(400).json({
          status: false,
          message: "Please provide valid data",
          error: error.name,
        });
      }

      res.status(500).json({
        status: false,
        message: "Internal server error",
        error,
      });
    }
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
