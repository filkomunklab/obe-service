import { z } from "zod";

const createRpsSchema = z
  .object({
    teacherId: z.string(),
    subjectId: z.string(),
    subjectFamily: z.string(),
    subjectDescription: z.string(),
    parallel: z
      .string()
      .length(1)
      .regex(/^[A-Za-z]$/, "Must be a single alphabetical character"),
    schedule: z.string(),
    rpsDeveloper: z.string(),
    headOfExpertise: z.string(),
    headOfProgramStudy: z.string(),
    cpmk: z.array(
      z.object({
        description: z.string(),
        code: z.string(),
        supportedCplIds: z.array(z.string()),
      })
    ),
    cpmkGrading: z
      .array(
        z
          .object({
            code: z.string(),
            totalGradingWeight: z.number(),
            gradingSystem: z.array(
              z.object({
                gradingName: z.string(),
                gradingWeight: z.number(),
              })
            ),
          })
          .refine((value: any) => {
            const total = value.gradingSystem.reduce(
              (a: number, b: any) => a + b.gradingWeight,
              0
            );
            if (total !== value.totalGradingWeight) {
              return false;
            }
            return true;
          }, "Total weight must be equal to grading weight")
      )
      .refine((value: any) => {
        const total = value.reduce(
          (a: number, b: any) => a + b.totalGradingWeight,
          0
        );
        if (total !== 100) {
          return false;
        }
        return true;
      }, "Total weight must be 100"),
    mainReferences: z.array(z.string()),
    supportingReferences: z.array(z.string()),
    software: z.string(),
    hardware: z.string(),
    teamTeaching: z.array(z.string()),
    minPassStudents: z.string(),
    minPassGrade: z.string(),
    meetingPlan: z.array(
      z.object({
        week: z.string(),
        cpmkList: z.array(z.string()),
        subCpmkDescription: z.string(),
        achievementIndicators: z.string(),
        assessmentModel: z.string(),
        material: z.string(),
        method: z.string(),
        offlineActivity: z.string(),
        onlineActivity: z.string(),
      })
    ),
    studentAssignmentPlan: z.array(
      z.object({
        assignmentModel: z.string(),
        references: z.string(),
        subLearningOutcomes: z.string(),
        assignmentDescription: z.string(),
        icbValuation: z.string(),
        dueSchedule: z.string(),
        others: z.string(),
        referenceList: z.string(),
      })
    ),
  })
  .refine((value: any) => {
    const total = value.cpmkGrading.reduce(
      (a: number, b: any) => a + b.totalGradingWeight,
      0
    );
    if (total !== 100) {
      return false;
    }
    return true;
  }, "Total weight must be 100");

export default createRpsSchema;
