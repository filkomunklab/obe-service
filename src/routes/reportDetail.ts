import express, { Router } from "express";
import prisma from "../database";
import { ReportDetail } from "@prisma/client";

const RouterReportDetail = express.Router();

RouterReportDetail.put("/:rpsId", async (req, res) => {
  const { rpsId } = req.params;
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
      return res.status(404).json({
        status: false,
        message: "RPS not found",
      });
    }

    const students = await prisma.student.findMany({
      where: {
        ClassStudent: {
          every: {
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

    if (!students) {
      return res.status(404).json({
        status: false,
        message: "Students not found",
      });
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

    const normalize: ReportDetail = {
      rpsId: rps.id,
      subjectName: `${rps.Subject.englishName} / ${rps.Subject.indonesiaName}`,
      major: rps.Subject.Curriculum_Subject.map(
        (item) => item.curriculum.major
      ).join(" | "),
      credits: rps.Subject.credits,
      parallel: rps.parallel,
      teacher: `${rps.teacher.firstName} ${rps.teacher.lastName}`,
      schedule: rps.schedule,
      gradingSystem: {},
      studentGrade: groupGradingSystem,
    };

    const result = await prisma.reportDetail.upsert({
      where: {
        rpsId: rps.id,
      },
      update: normalize,
      create: normalize,
    });

    return res.json({
      status: true,
      message: "Data retrieved",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
});

RouterReportDetail.get("/:rpsId", async (req, res) => {
  const { rpsId } = req.params;
  try {
    const data = await prisma.reportDetail.findUnique({
      where: {
        rpsId,
      },
    });

    if (!data) {
      return res.status(404).json({
        status: false,
        message: "Data not found",
      });
    }

    return res.json({
      status: true,
      message: "Data retrieved",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error,
    });
  }
});

export default RouterReportDetail;
