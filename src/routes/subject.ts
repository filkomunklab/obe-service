import prisma from "../database";
import { Subject_Cpl } from "../../global";
import { auth, validateSchema } from "../middleware";
import { mappingCplSchema } from "../schemas";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

const RouterSubject = new Hono();

RouterSubject.get("/", auth, async (c) => {
  try {
    const data = await prisma.subject.findMany({
      include: {
        Subject_Cpl: true,
      },
    });
    if (data.length === 0) {
      return c.json(
        {
          status: false,
          message: "Data not found",
        },
        404
      );
    }
    return c.json({
      status: true,
      message: "Data retrieved",
      data,
    });
  } catch (error) {
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
});

RouterSubject.get("/:id/cpl", auth, async (c) => {
  const id = c.req.param("id");
  try {
    const data = await prisma.subject.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        Subject_Cpl: {
          select: {
            id: true,
            cpl: true,
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
    return c.json({
      status: true,
      message: "Data retrieved",
      data,
    });
  } catch (error) {
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
});

RouterSubject.get("/:id/prerequisite", auth, async (c) => {
  const id = c.req.param("id");
  try {
    const data = await prisma.subject.findUnique({
      where: {
        id,
      },
      include: {
        Curriculum_Subject: {
          select: {
            curriculum: true,
            prerequisite: true,
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
    const Prerequisite = await Promise.all(
      data?.Curriculum_Subject.map(async (item) => ({
        curriculum: item.curriculum,
        prerequisite: await prisma.subject.findMany({
          where: {
            code: {
              in: item.prerequisite,
            },
          },
        }),
      }))
    );
    const { Curriculum_Subject, ...withoutCurrSub } = data; // remove Curriculum_Subject from data

    const normalize = { ...withoutCurrSub, Prerequisite };
    return c.json({
      status: true,
      message: "Data retrieved",
      data: normalize,
    });
  } catch (error) {
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
});

RouterSubject.put(
  "/:id/cpl-mapping",
  auth,
  zValidator("json", mappingCplSchema),
  async (c) => {
    try {
      const { cplIds } = c.req.valid("json");
      const id = c.req.param("id");

      const payload: Subject_Cpl[] = cplIds.map((cplId: string) => {
        return {
          cplId,
          subjectId: id,
        };
      });

      const data = await prisma.$transaction(async (prisma) => {
        const deletedCpl = await prisma.subject_Cpl.findMany({
          where: {
            cplId: {
              notIn: cplIds,
            },
          },
        });

        await prisma.subject_Cpl.createMany({
          data: payload,
          skipDuplicates: true,
        });

        if (deletedCpl.length > 0) {
          await prisma.subject_Cpl.deleteMany({
            where: {
              cplId: {
                in: deletedCpl.map((cpl) => cpl.cplId),
              },
              subjectId: id,
            },
          });
        }

        return await prisma.subject.findUnique({
          where: {
            id,
          },
          include: {
            Subject_Cpl: {
              select: {
                cpl: true,
              },
            },
          },
        });
      });

      return c.json(
        {
          status: true,
          message: "CPLs mapped to subject",
          data,
        },
        201
      );
    } catch (error: any) {
      if (error.code === "P2003") {
        return c.json(
          {
            status: false,
            message: "Subject or CPL not found",
            error,
          },
          404
        );
      }

      if (error.code === "P2002") {
        return c.json(
          {
            status: false,
            message: "CPL already mapped to subject",
            error,
          },
          409
        );
      }

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

RouterSubject.get("/:id/cpl-mapping", auth, async (c) => {
  try {
    const id = c.req.param("id");
    const data = await prisma.subject.findUnique({
      where: {
        id,
      },
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
                id: true,
              },
            },
          },
        },
        Curriculum_Subject: {
          select: {
            curriculum: {
              select: {
                id: true,
                major: true,
                year: true,
                Cpl: {
                  select: {
                    id: true,
                    code: true,
                    description: true,
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

    return c.json({
      status: true,
      message: "Data retrieved",
      data,
    });
  } catch (error) {
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

export default RouterSubject;
