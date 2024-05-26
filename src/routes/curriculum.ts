import prisma from "../database";
import { extractXlsx, parsePrerequisites } from "../utils";
import { Cpl, CurriculumFile } from "../../global";
import { auth } from "../middleware";
import { xlsxFileSchema, createCurriculumSchema } from "../schemas";
import cplSchema from "../schemas/cplSchema";
import curriculumSchema from "../schemas/curriculumSchema";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

const RouterCurriculum = new Hono();

// post Curriculum
RouterCurriculum.post(
  "/",
  auth,
  zValidator("form", createCurriculumSchema),
  async (c) => {
    const { major, year, headOfProgramStudyId, curriculumFile } =
      c.req.valid("form");

    try {
      const data = await extractXlsx(curriculumFile);
      const parsedData: CurriculumFile[] = data.map((row: any) => ({
        code: row.code,
        indonesiaName: row.indonesiaName,
        englishName: row.englishName,
        credits: parseInt(row.credits),
        type: row.type,
        prerequisite: parsePrerequisites(row.prerequisite),
        semester: parseInt(row.semester),
      }));

      const validation = await curriculumSchema.spa(parsedData);
      if (!validation.success) {
        return c.json(
          {
            status: false,
            message: "Please provide valid xlsx data",
            error: validation.error,
          },
          400
        );
      }

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
          skipDuplicates: true,
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
            semester:
              parsedData.find((data) => data.code === subject.code)?.semester ||
              0,
          })),
        });

        return await prisma.curriculum.findUnique({
          where: {
            id: curriculum.id,
          },
          include: {
            _count: {
              select: {
                Curriculum_Subject: true,
              },
            },
            Curriculum_Subject: {
              include: {
                subject: true,
              },
            },
          },
        });
      });

      return c.json(
        {
          status: true,
          message: "Curriculum created successfully",
          data: createCurriculum,
        },
        201
      );
    } catch (error: any) {
      if (error.name === "ZodError") {
        return c.json(
          {
            status: false,
            message: "Please provide valid xlsx data",
          },
          400
        );
      }

      if (error.code === "P2002") {
        return c.json(
          {
            status: false,
            message: "Curriculum already exist",
            error,
          },
          409
        );
      }

      if (error.code === "P2003") {
        return c.json(
          {
            status: false,
            message: "Head of program study not found",
            error,
          },
          404
        );
      }

      console.log(error);

      return c.json(
        {
          status: false,
          message: "Internal server error",
          error,
        },
        500
      );
    }
  }
);

// post Curriculum Cpl
RouterCurriculum.post(
  "/:id/cpl",
  auth,
  zValidator("form", xlsxFileSchema),
  async (c) => {
    const id = c.req.param("id");
    const { file } = c.req.valid("form");

    try {
      const data = await extractXlsx(file);
      const parsedData: Cpl[] = data.map((row: any) => ({
        code: row.code,
        description: row.description,
        curriculumId: id,
      }));

      await cplSchema.spa(parsedData);

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

      c.json(
        {
          status: true,
          message: "Curriculum's CPLs created successuly",
          data: result,
        },
        201
      );
    } catch (error: any) {
      if (error.code === "P2002") {
        return c.json(
          {
            status: false,
            message: "Curriculum's CPLs already exist",
            error,
          },
          409
        );
      }

      if (error.code === "P2003") {
        return c.json(
          {
            status: false,
            message: "Curriculum not found",
            error,
          },
          404
        );
      }

      if (error.name === "ValidationError") {
        return c.json(
          {
            status: false,
            message: "Please provide valid data",
            error: error.name,
          },
          400
        );
      }

      console.log(error);
      c.json(
        {
          status: false,
          message: "Internal server error",
          error,
        },
        500
      );
    }
  }
);

RouterCurriculum.get("/", auth, async (c) => {
  try {
    const major = c.req.query("major");
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
      return c.json(
        {
          status: false,
          message: "Data not found",
        },
        404
      );
    }

    c.json({
      status: true,
      message: "Data retrieved",
      data,
    });
  } catch (error) {
    console.error(error);
    c.json(
      {
        status: false,
        message: "Internal server error",
        error,
      },
      500
    );
  }
});

RouterCurriculum.get("/:id", auth, async (c) => {
  try {
    const id = c.req.param("id");
    const data = await prisma.curriculum.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        major: true,
        year: true,
        Cpl: true,
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
      return c.json(
        {
          status: false,
          message: "Data not found",
        },
        404
      );
    }

    c.json({
      status: true,
      message: "Data retrieved",
      data,
    });
  } catch (error) {
    console.error(error);
    c.json(
      {
        status: false,
        message: "Internal server error",
        error,
      },
      500
    );
  }
});

RouterCurriculum.delete("/:id", auth, async (c) => {
  const id = c.req.param("id");
  try {
    const data = await prisma.curriculum.delete({
      where: {
        id,
      },
    });

    await prisma.rps.deleteMany({
      where: {
        Subject: {
          Curriculum_Subject: {
            some: {
              curriculumId: id,
            },
          },
        },
      },
    });

    c.json({
      status: true,
      message: "Data deleted",
      data,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return c.json(
        {
          status: false,
          message: "Data not found",
          error,
        },
        404
      );
    }

    console.error(error);
    return c.json(
      {
        status: false,
        message: "Internal server error",
        error,
      },
      500
    );
  }
});

export default RouterCurriculum;
