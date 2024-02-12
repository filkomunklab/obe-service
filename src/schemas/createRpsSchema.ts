import * as yup from "yup";

const calculateTotalGradingWeight = function (value: any) {
  const gradingWeight = this.parent.gradingSystem.map(
    (grading: any) => grading.gradingWeight
  );
  return gradingWeight.reduce((a: number, b: number) => a + b, 0) === value;
};

const createRpsSchema = yup
  .object()
  .shape({
    teacherId: yup.string().required(),
    subjectId: yup.string().required(),
    subjectFamily: yup.string().required(),
    subjectDescription: yup.string().required(),
    parallel: yup
      .string()
      .length(1)
      .matches(/^[A-Za-z]$/, "Must be a single alphabetical character")
      .required(),
    semester: yup.number().positive().required(),
    schedule: yup.string().required(),
    rpsDeveloper: yup.string().required(),
    headOfExpertise: yup.string().required(),
    headOfProgramStudy: yup.string().required(),
    cpmk: yup
      .array()
      .of(
        yup
          .object()
          .shape({
            description: yup.string().required(),
            code: yup.string().required(),
            supportedCplIds: yup.array().of(yup.string()).required(),
          })
          .noUnknown()
      )
      .required(),
    cpmkGrading: yup.array().of(
      yup
        .object()
        .shape({
          code: yup.string().required(),
          // this total height must same with sum of gradingWeight
          totalGradingWeight: yup
            .number()
            .required()
            .test(
              "is-valid-total-weight",
              "Total weight must same with sum of gradingWeight ",
              calculateTotalGradingWeight
            ),
          gradingSystem: yup
            .array()
            .of(
              yup.object().shape({
                gradingName: yup.string().required(),
                gradingWeight: yup.number().required(),
              })
            )
            .required(),
        })
        .noUnknown()
    ),
    mainReferences: yup.array().of(yup.string()).required(),
    supportingReferences: yup.array().of(yup.string()).required(),
    software: yup.string().required(),
    hardware: yup.string().required(),
    teamTeaching: yup.array().of(yup.string()).required(),
    minPassStudents: yup.string().required(),
    minPassGrade: yup.string().required(),
    meetingPlan: yup
      .array()
      .of(
        yup
          .object()
          .shape({
            week: yup.string().required(),
            cpmkList: yup.array().of(yup.string()).required(),
            subCpmkDescription: yup.string().required(),
            achievementIndicators: yup.string().required(),
            assessmentModel: yup.string().required(),
            material: yup.string().required(),
            method: yup.string().required(),
            offlineActivity: yup.string().required(),
            onlineActivity: yup.string().required(),
          })
          .noUnknown()
      )
      .required(),
    studentAssignmentPlan: yup
      .array()
      .of(
        yup
          .object()
          .shape({
            title: yup.string().required(),
            assignmentModel: yup.string().required(),
            references: yup.string().required(),
            subLearningOutcomes: yup.string().required(),
            assignmentDescription: yup.string().required(),
            icbValuation: yup.string().required(),
            dueSchedule: yup.string().required(),
            others: yup.string().required(),
            referenceList: yup.string().required(),
          })
          .noUnknown()
      )
      .required(),
  })
  .test("is-valid-sum", "Total weight must be 100", (value) => {
    const total = value.cpmkGrading.reduce(
      (a: number, b: any) => a + b.totalGradingWeight,
      0
    );
    if (total !== 100) {
      throw new yup.ValidationError(
        "Total weight must be 100",
        value,
        "cpmkGrading"
      );
    }
    return true;
  })
  .noUnknown();

export default createRpsSchema;
