import epxress from "express";
import prisma from "../database";
import { studentCpmkGradeType } from "../../global";
import { auth } from "../middleware";
import { convertShortMajor } from "../utils";

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
        CpmkGrading: {
          select: {
            id: true,
            code: true,
            totalGradingWeight: true,
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
          some: {
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
      const averagePerCpmk = rps.CpmkGrading.reduce((acc: any, curr) => {
        const sumOfGrades = curr.GradingSystem.reduce((acc, curr) => {
          const targetGrade = item.StudentGrade.find(
            (item) => item.GradingSystem.id === curr.id
          );
          if (!targetGrade) return acc;
          return acc + targetGrade.score;
        }, 0);
        const average = (sumOfGrades / curr.totalGradingWeight) * 100;
        const result = { code: curr.code, id: curr.id, average };
        acc.push(result);
        return acc;
      }, []);
      const overallAvg = averagePerCpmk.reduce((total, item, index, array) => {
        total += item.average;
        if (index === array.length - 1) {
          total = total / array.length;
        }
        return total;
      }, 0);
      return { averagePerCpmk, overallAvg };
    };

    const studentCpmkGrade = students.map((item) => {
      const calculatedGrade = calculateGrade(item);
      return {
        ...item,
        maxGrade: calculatedGrade.averagePerCpmk.reduce((max, item) => {
          if (item.average > max.average) {
            return item;
          }
          return max;
        }, calculatedGrade.averagePerCpmk[0]),
        minGrade: calculatedGrade.averagePerCpmk.reduce((min, item) => {
          if (item.average < min.average) {
            return item;
          }
          return min;
        }, calculatedGrade.averagePerCpmk[0]),
        StudentGrade: calculatedGrade.averagePerCpmk,
        average: calculatedGrade.overallAvg,
      };
    });

    const calculateCpmkGradeSummary = (data: studentCpmkGradeType[]) => {
      const desctructering = data.map((item) => item.StudentGrade);
      const flatted = desctructering.flat();

      const totalAverage = flatted.reduce((accumulator, current) => {
        if (!accumulator[current.code]) {
          accumulator[current.code] = {
            code: current.code,
            sum: 0,
            count: 0,
            id: current.id,
          };
        }
        accumulator[current.code].sum += current.average;
        accumulator[current.code].count++;
        return accumulator;
      }, {});

      const avgEach = Object.values(totalAverage).map(
        (item: { [code: string]: number }) => ({
          id: item.id,
          code: item.code,
          average: item.sum / item.count,
        })
      );
      const overallAvg = avgEach.reduce((acc, curr, index, array) => {
        acc += curr.average;
        if (index === array.length - 1) acc /= array.length;
        return acc;
      }, 0);
      return { avgEach, overallAvg, maxItem, minItem };
    };

    const cpmkGradeSummary = calculateCpmkGradeSummary(studentCpmkGrade);
    const maxItem = cpmkGradeSummary.avgEach.reduce((max, item) => {
      if (item.average > max.average) {
        return item;
      }
      return max;
    }, cpmkGradeSummary.avgEach[0]);
    const minItem = cpmkGradeSummary.avgEach.reduce((min, item) => {
      if (item.average < min.average) {
        return item;
      }
      return min;
    }, cpmkGradeSummary.avgEach[0]);

    const normalize = {
      rpsId: rps.id,
      credits: rps.Subject.credits,
      parallel: rps.parallel,
      schedule: rps.schedule,
      teacher: `${rps.teacher.firstName} ${rps.teacher.lastName}`,
      subjectName: `${rps.Subject.englishName} / ${rps.Subject.indonesiaName}`,
      major: rps.Subject.Curriculum_Subject.map((item) =>
        convertShortMajor(item.curriculum.major)
      ).join(" | "),
      semester: rps.Subject.Curriculum_Subject.map(
        (item) => item.semester
      ).join(" | "),
      status: "NEED TO BE IMPLEMENTED LATER",
      curriculum: rps.Subject.Curriculum_Subject.map(
        (item) => item.curriculum.year
      ).join(" | "),
      studentCpmkGrade,
      cpmkGradeSummary,
      highestCpmk: maxItem,
      lowestCpmk: minItem,
      updateAt: new Date(),
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

RouterReportSummary.get("/:rpsId", auth, async (req, res) => {
  const { rpsId } = req.params;
  try {
    const data = await prisma.reportSummary.findUnique({
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

export default RouterReportSummary;
