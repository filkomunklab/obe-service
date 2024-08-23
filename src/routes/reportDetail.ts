import prisma from "../database";
import { ReportDetail } from "@prisma/client";
import { auth } from "../middleware";
import { Hono } from "hono";

const RouterReportDetail = new Hono();

RouterReportDetail.put("/:rpsId", auth, async (c) => {
  const { rpsId } = c.req.param();
  try {
    const rps = await prisma.rps.findUnique({
      where: {
        id: rpsId,
      },
      select: {
        id: true,
        Subject: {
          select: {
            Curriculum_Subject: {
              select: {
                curriculum: {
                  select: {
                    major: true,
                  },
                },
              },
            },
            indonesiaName: true,
            englishName: true,
            credits: true,
          },
        },
        parallel: true,
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        schedule: true,
        CpmkGrading: {
          include: {
            GradingSystem: true,
          },
        },
      },
    });

    if (!rps) {
      return c.json(
        {
          status: false,
          message: "RPS not found",
        },
        404
      );
    }

    const students = await prisma.student.findMany({
      where: {
        ClassStudent: {
          some: {
            rpsId,
          },
        },
      },
      select: {
        firstName: true,
        lastName: true,
        nim: true,
        id: true,
        StudentGrade: true,
      },
    });

    if (students.length === 0) {
      return c.json(
        {
          status: false,
          message: "Students not found. Add students to the class first.",
        },
        404
      );
    }

    const groupGradingSystem = rps.CpmkGrading.map((item) => {
      return {
        code: item.code,
        studentList: students.map((student) => {
          const matchedGrade = item.GradingSystem.map((grading) => {
            const matchedStudentGrade = student.StudentGrade.find((grade) => {
              return grade.gradingSystemId === grading.id;
            });
            const rawGrade = matchedStudentGrade
              ? matchedStudentGrade.rawGrade
              : 0;
            const score = matchedStudentGrade ? matchedStudentGrade.score : 0;
            return {
              gradingName: grading.gradingName,
              gradingId: grading.id,
              rawGrade: rawGrade,
              score: score,
            };
          });
          return {
            name: `${student.firstName} ${student.lastName}`,
            nim: student.nim,
            grading: matchedGrade,
          };
        }),
      };
    });

    const normalize: Omit<ReportDetail, "createAt" | "studentGrade"> & {
      studentGrade: any;
    } = {
      rpsId: rps.id,
      subjectName: `${rps.Subject.englishName} / ${rps.Subject.indonesiaName}`,
      major: rps.Subject.Curriculum_Subject.map(
        (item) => item.curriculum.major
      ).join(" | "),
      credits: rps.Subject.credits,
      parallel: rps.parallel,
      teacher: `${rps.teacher.firstName} ${rps.teacher.lastName}`,
      schedule: rps.schedule,
      studentGrade: JSON.stringify(groupGradingSystem),
      updateAt: new Date(),
    };

    const result = await prisma.reportDetail.upsert({
      where: {
        rpsId: rps.id,
      },
      update: normalize,
      create: normalize,
    });

    return c.json({
      status: true,
      message: "Data retrieved",
      data: result,
    });
  } catch (error: any) {
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

RouterReportDetail.get("/:rpsId", auth, async (c) => {
  const { rpsId } = c.req.param();
  try {
    const data = await prisma.reportDetail.findUnique({
      where: {
        rpsId,
      },
      include: {
        Rps: {
          select: {
            CpmkGrading: {
              include: {
                GradingSystem: true,
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

export default RouterReportDetail;
