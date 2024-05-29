import prisma from "../database";
import { studentCpmkGradeType } from "../../global";
import { auth } from "../middleware";
import { convertShortMajor } from "../utils";
import { Hono } from "hono";

const RouterReportSummary = new Hono();

RouterReportSummary.put("/:rpsId", async (c) => {
  const { rpsId } = c.req.param();
  try {
    const assessmentIndicator = await prisma.assessmentIndicator.findMany();
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
            (item: any) => item.GradingSystem.id === curr.id
          );
          if (!targetGrade) return acc;
          return acc + targetGrade.score;
        }, 0);
        const average = (sumOfGrades / curr.totalGradingWeight) * 100;
        const result = { code: curr.code, id: curr.id, average };
        acc.push(result);
        return acc;
      }, []);
      const overallAvg = averagePerCpmk.reduce(
        (total: any, item: any, index: any, array: any) => {
          total += item.average;
          if (index === array.length - 1) {
            total = total / array.length;
          }
          return total;
        },
        0
      );
      return { averagePerCpmk, overallAvg };
    };

    const studentCpmkGrade = students.map((item) => {
      const calculatedGrade = calculateGrade(item);
      return {
        ...item,
        maxGrade: calculatedGrade.averagePerCpmk.reduce(
          (max: any, item: any) => {
            if (item.average > max.average) {
              return item;
            }
            return max;
          },
          calculatedGrade.averagePerCpmk[0]
        ),
        minGrade: calculatedGrade.averagePerCpmk.reduce(
          (min: any, item: any) => {
            if (item.average < min.average) {
              return item;
            }
            return min;
          },
          calculatedGrade.averagePerCpmk[0]
        ),
        StudentGrade: calculatedGrade.averagePerCpmk,
        average: calculatedGrade.overallAvg,
      };
    });

    const calculateCpmkGradeSummary: any = (data: studentCpmkGradeType[]) => {
      const desctructering = data.map((item) => item.StudentGrade);
      const flatted = desctructering.flat();

      const totalAverage: any[] = flatted.reduce(
        (accumulator: any, current) => {
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
        },
        {}
      );

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
      return { avgEach, overallAvg };
    };

    const cpmkGradeSummary = calculateCpmkGradeSummary(studentCpmkGrade);
    const maxItem = cpmkGradeSummary.avgEach.reduce((max: any, item: any) => {
      if (item.average > max.average) {
        return item;
      }
      return max;
    }, cpmkGradeSummary.avgEach[0]);
    const minItem = cpmkGradeSummary.avgEach.reduce((min: any, item: any) => {
      if (item.average < min.average) {
        return item;
      }
      return min;
    }, cpmkGradeSummary.avgEach[0]);
    const status =
      assessmentIndicator.find((item) => {
        return (
          cpmkGradeSummary.overallAvg >= Math.floor(item.minScore) &&
          cpmkGradeSummary.overallAvg <= Math.floor(item.maxScore)
        );
      })?.description || "Assessment Not Found";

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
      status,
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
    return c.json({
      status: true,
      message: "Success",
      data: result,
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

RouterReportSummary.get("/:rpsId", auth, async (c) => {
  const { rpsId } = c.req.param();
  try {
    const data = await prisma.reportSummary.findUnique({
      where: {
        rpsId,
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

export default RouterReportSummary;
