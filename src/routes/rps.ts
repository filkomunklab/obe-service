import { auth } from "../middleware";
import { createRpsSchema, xlsxFileSchema } from "../schemas";
import prisma from "../database";
import { extractXlsx } from "../utils";
import { ClassStudent, Major, status } from "@prisma/client";
import classMemberSchema from "../schemas/classMemberSchema";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import oneOf from "../utils/oneOf";

const RouterRps = new Hono();

RouterRps.get("/:id", auth, async (c) => {
  const id = c.req.param("id");
  try {
    const data = await prisma.rps.findUnique({
      where: {
        id,
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        Subject: {
          include: {
            Subject_Cpl: {
              include: {
                cpl: true,
              },
            },
            Curriculum_Subject: {
              include: {
                curriculum: true,
              },
            },
          },
        },
        MeetingPlan: true,
        StudentAssignmentPlan: true,
        CpmkGrading: {
          include: {
            GradingSystem: true,
          },
        },
        Cpmk: {
          include: {
            SupportedCpl: {
              include: {
                cpl: true,
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
          message: "Rps not found",
        },
        404
      );
    }

    const Prerequisite = await Promise.all(
      data?.Subject.Curriculum_Subject.map(async (item) => ({
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

    return c.json({
      status: true,
      message: "Success",
      data: { ...data, Prerequisite },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return c.json(
        {
          status: false,
          message: "Rps not found",
          error,
        },
        404
      );
    }

    console.log(error);
    return c.json(
      {
        status: false,
        message: "Internal Server Error",
        error,
      },
      500
    );
  }
});

RouterRps.delete("/:id", auth, async (c) => {
  const id = c.req.param("id");
  try {
    const data = await prisma.rps.delete({
      where: {
        id,
      },
    });
    return c.json({
      status: true,
      message: "Success",
      data,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return c.json(
        {
          status: false,
          message: "Rps not found",
          error,
        },
        404
      );
    }

    console.log(error);
    return c.json(
      {
        status: false,
        message: "Internal Server Error",
        error,
      },
      500
    );
  }
});

RouterRps.patch(
  "/:id",
  auth,
  zValidator(
    "json",
    z.object({
      status: oneOf(Object.values(status) as any),
    })
  ),
  async (c) => {
    const id = c.req.param("id");
    const { status } = c.req.valid("json");
    try {
      const data = await prisma.rps.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });
      return c.json({
        status: true,
        message: "Success",
        data,
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        return c.json(
          {
            status: false,
            message: "Rps not found",
            error,
          },
          404
        );
      }

      console.log(error);
      return c.json(
        {
          status: false,
          message: "Internal Server Error",
          error,
        },
        500
      );
    }
  }
);

RouterRps.get("/list/all", async (c) => {
  const { major, curriculumId } = c.req.query();
  try {
    const data = await prisma.rps.findMany({
      where: {
        Subject: {
          Curriculum_Subject: {
            some: {
              curriculum: {
                OR: [
                  { major: major as string },
                  { id: curriculumId as string },
                ],
              },
            },
          },
        },
      },
      select: {
        id: true,
        status: true,
        Subject: {
          select: {
            code: true,
            indonesiaName: true,
            englishName: true,
            Curriculum_Subject: {
              select: {
                semester: true,
                curriculum: {
                  select: {
                    major: true,
                  },
                },
              },
            },
          },
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        updatedAt: true,
        _count: {
          select: {
            ClassStudent: true,
          },
        },
      },
    });
    return c.json({
      status: true,
      message: "Success",
      data,
    });
  } catch (error) {
    console.log(error);
    return c.json(
      {
        status: false,
        message: "Internal Server Error",
        error,
      },
      500
    );
  }
});

RouterRps.get("/list/major-summary", async (c) => {
  try {
    const data = await prisma.curriculum.findMany({
      select: {
        major: true,
        headOfProgramStudy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        Curriculum_Subject: {
          select: {
            subject: {
              select: {
                Rps: {
                  select: {
                    teacherId: true,
                  },
                },
                _count: {
                  select: {
                    Rps: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const normalize = Object.keys(Major).map((key) => ({
      major: key,
      headOfProgramStudy: data.find((item) => item.major === key)
        ?.headOfProgramStudy,
      totalRps: data
        .find((item) => item.major === key)
        ?.Curriculum_Subject.reduce(
          (acc, curr) => acc + curr.subject._count.Rps,
          0
        ),
    }));

    const filter = normalize.filter(
      (item) => item.major !== "NONE" && item.major !== "DKV"
    );

    return c.json({
      status: true,
      message: "Success",
      data: filter,
    });
  } catch (error) {
    console.log(error);
    return c.json(
      {
        status: false,
        message: "Internal Server Error",
        error,
      },
      500
    );
  }
});

RouterRps.get("/list/teacher/:teacherId", auth, async (c) => {
  const { teacherId } = c.req.param();
  try {
    const rps = await prisma.rps.findMany({
      where: {
        teacherId: teacherId as string,
      },
      select: {
        id: true,
        status: true,
        Subject: {
          select: {
            code: true,
            indonesiaName: true,
            englishName: true,
            credits: true,
            Curriculum_Subject: {
              select: {
                semester: true,
                curriculum: {
                  select: {
                    major: true,
                  },
                },
              },
            },
          },
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        updatedAt: true,
        _count: {
          select: {
            ClassStudent: true,
          },
        },
      },
    });
    if (rps.length === 0) {
      return c.json(
        {
          status: false,
          message: "Data not found",
        },
        404
      );
    }
    const metadata = {
      teacher: rps[0]?.teacher,
      creditsTotal: rps.reduce((acc: any, curr) => {
        return acc + curr.Subject.credits;
      }, 0),
      studentsTotal: rps.reduce((acc: any, curr) => {
        return acc + curr._count.ClassStudent;
      }, 0),
      rpsTotal: rps.length,
    };
    return c.json({
      status: true,
      message: "Success",
      data: { rps, metadata },
    });
  } catch (error) {
    console.log(error);
    return c.json(
      {
        status: false,
        message: "Internal Server Error",
        error,
      },
      500
    );
  }
});

RouterRps.post("/", auth, zValidator("json", createRpsSchema), async (c) => {
  const body = c.req.valid("json");
  try {
    const {
      cpmkGrading: cpmkGradingPayload,
      cpmk: cpmkPayload,
      studentAssignmentPlan,
      meetingPlan,
      ...rpsPayload
    } = body;
    const result = await prisma.$transaction(async (prisma) => {
      // create rps
      const rps = await prisma.rps.create({
        data: {
          ...rpsPayload,
          MeetingPlan: {
            createMany: {
              data: meetingPlan,
            },
          },
          StudentAssignmentPlan: {
            createMany: {
              data: studentAssignmentPlan,
            },
          },
        },
      });

      // insert grading system
      await Promise.all(
        cpmkGradingPayload.map(async (data) => {
          const { gradingSystem, ...payload } = data;
          await prisma.cpmkGrading.create({
            data: {
              rpsId: rps.id,
              ...payload,
              GradingSystem: {
                createMany: { data: gradingSystem },
              },
            },
          });
        })
      );

      // insert cpmk
      await Promise.all(
        cpmkPayload.map(async (data) => {
          const { supportedCplIds, ...payload } = data;
          await prisma.cpmk.create({
            data: {
              rpsId: rps.id,
              ...payload,
              SupportedCpl: {
                createMany: {
                  data: supportedCplIds.map((value) => ({ cplId: value })),
                },
              },
            },
          });
        })
      );

      return await prisma.rps.findUnique({
        where: {
          id: rps.id,
        },
        include: {
          CpmkGrading: {
            include: {
              GradingSystem: true,
            },
          },
          MeetingPlan: true,
          StudentAssignmentPlan: true,
          Cpmk: true,
        },
      });
    });

    return c.json(
      {
        status: true,
        message: "Rps created successfully",
        data: result,
      },
      201
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return c.json(
        {
          status: false,
          message: "Conflict! please check dupplicate data or code",
          error,
        },
        409
      );
    }

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
    console.log(error);
    return c.json(
      {
        status: false,
        message: "Internal Server Error",
        error,
      },
      500
    );
  }
});

RouterRps.post(
  "/:id/member",
  auth,
  zValidator("form", xlsxFileSchema),
  async (c) => {
    const { id } = c.req.param();
    const { file } = c.req.valid("form");
    try {
      const data = await extractXlsx(file);
      const parsedData: Pick<ClassStudent, "rpsId" | "studentNim">[] = data.map(
        (row: any) => ({
          rpsId: id,
          studentNim: row.nim?.toString(),
        })
      );
      const students = await prisma.student.findMany({
        select: {
          nim: true,
        },
      });
      const unkownNim = parsedData
        .map((item) => item.studentNim)
        .filter((nim) => {
          return !students.find((student) => student.nim === nim);
        });
      if (unkownNim.length > 0) {
        return c.json({
          status: false,
          message: `These NIM didn't exist on database: ${
            (unkownNim.join(", "), 404)
          }`,
        });
      }
      const isValid = await classMemberSchema.spa(parsedData);
      if (!isValid.success) {
        return c.json(
          {
            status: false,
            message: "Validation error. Please provide correct data",
            error: isValid.error,
          },
          400
        );
      }
      const rps = await prisma.rps.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });
      if (!rps) {
        return c.json(
          {
            status: false,
            message: "Rps not found",
          },
          404
        );
      }
      const result = await prisma.classStudent.createMany({
        data: parsedData,
        skipDuplicates: true,
      });
      return c.json(
        {
          status: true,
          message: "Member added to Rps",
          data: result,
        },
        201
      );
    } catch (error: any) {
      if (error.code === "P2002") {
        return c.json(
          {
            status: false,
            message: "Student already in the class",
            error,
          },
          409
        );
      }

      if (error.name === "ZodError") {
        return c.json(
          {
            status: false,
            message: "Validation error. Please provide correct data",
            error: error.errors,
          },
          400
        );
      }
      console.log(error);
      return c.json(
        {
          status: false,
          message: "Internal Server Error",
          error,
        },
        500
      );
    }
  }
);

export default RouterRps;
