import epxress from "express";
import prisma from "../database";
import { ReportSummary } from "@prisma/client";
import { studentCpmkGradeType } from "../../global";

const RouterReportSummary = epxress.Router();

RouterReportSummary.put("/:rpsId", async (req, res) => {
  const { rpsId } = req.params;
  try {
    const rps = await prisma.rps.findUnique({
      where: {
        id: rpsId,
      },
      select: {
        id: true,
        parallel: true,
        schedule: true,
        Subject: {
          include: {
            Curriculum_Subject: {
              select: {
                semester: true,
                curriculum: true,
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
        StudentGrade: {
          select: {
            id: true,
            rawGrade: true,
            score: true,
            GradingSystem: {
              select: {
                id: true,
                gradingName: true,
                gradingWeight: true,
                CpmkGrading: {
                  select: {
                    code: true,
                    totalGradingWeight: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const calculateGrade = (item: any) => {
      const averageGrades = item.StudentGrade.reduce((acc, curr) => {
        const code = curr.GradingSystem.CpmkGrading.code;
        const score = curr.score;
        const totalGradingWeight =
          curr.GradingSystem.CpmkGrading.totalGradingWeight;

        if (!acc[code]) {
          acc[code] = { totalScore: 0, totalWeight: totalGradingWeight };
        }
        acc[code].totalScore += score;

        return acc;
      }, {});

      for (const code in averageGrades) {
        const totalScore = averageGrades[code].totalScore;
        const totalWeight = averageGrades[code].totalWeight;
        averageGrades[code] = (totalScore / totalWeight) * 100;
      }

      return averageGrades;
    };

    const calculateAverage = (averageGrades) => {
      let totalAverage = 0;
      for (const code in averageGrades) {
        totalAverage += averageGrades[code];
      }

      return totalAverage / Object.keys(averageGrades).length;
    };

    const studentCpmkGrade = students.map((item) => {
      return {
        ...item,
        StudentGrade: calculateGrade(item),
        average: calculateAverage(calculateGrade(item)),
      };
    });

    const cpmkGradeSummary = (data: studentCpmkGradeType[]) => {
      const totalSum = {};
      const totalCount = {};
      data.forEach((student) => {
        for (const code in student.StudentGrade) {
          totalSum[code] = (totalSum[code] || 0) + student.StudentGrade[code];
          totalCount[code] = (totalCount[code] || 0) + 1;
        }
      });

      // Calculate total average for each code
      const avgEach: { [key: string]: number } = {};
      for (const code in totalSum) {
        avgEach[code] = totalSum[code] / totalCount[code];
      }

      // Calculate overall average
      let overallTotal = 0;
      let overallCount = 0;
      for (const code in totalSum) {
        overallTotal += totalSum[code];
        overallCount += totalCount[code];
      }
      const overallAvg = overallTotal / overallCount;

      return {
        avgEach,
        overallAvg,
      };
    };

    const normalize: Omit<ReportSummary, "createAt" | "updateAt"> = {
      rpsId: rps.id,
      credits: rps.Subject.credits,
      parallel: rps.parallel,
      schedule: rps.schedule,
      teacher: `${rps.teacher.firstName} ${rps.teacher.lastName}`,
      subjectName: `${rps.Subject.englishName} / ${rps.Subject.indonesiaName}`,
      major: rps.Subject.Curriculum_Subject.map(
        (item) => item.curriculum.major
      ).join(" | "),
      semester: rps.Subject.Curriculum_Subject.map(
        (item) => item.semester
      ).join(" | "),
      status: "NEED TO BE IMPLEMENTED LATER",
      curriculum: rps.Subject.Curriculum_Subject.map(
        (item) => item.curriculum.year
      ).join(" | "),
      studentCpmkGrade,
      cpmkGradeSummary: cpmkGradeSummary(studentCpmkGrade),
      highestCpmk: Math.max(
        ...Object.values(cpmkGradeSummary(studentCpmkGrade).avgEach)
      ),
      lowestCpmk: Math.min(
        ...Object.values(cpmkGradeSummary(studentCpmkGrade).avgEach)
      ),
    };

    const result = await prisma.reportSummary.upsert({
      where: {
        rpsId: rps.id,
      },
      update: normalize,
      create: normalize,
    });
    res.status(200).json({
      status: true,
      message: "Success",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error,
    });
  }
});

export default RouterReportSummary;
