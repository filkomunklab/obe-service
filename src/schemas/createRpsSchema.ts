import * as yup from "yup";

const createRpsSchema = yup
  .object()
  .shape({
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
    headOfExpretise: yup.string().required(),
    headOfProgramStudy: yup.string().required(),
    mainReferences: yup.array().of(yup.string()).required(),
    supportingReferences: yup.array().of(yup.string()).required(),
    software: yup.string().required(),
    hardware: yup.string().required(),
    teamTeaching: yup.array().of(yup.string()).required(),
    minPassStudents: yup.string().required(),
    minPassGrade: yup.string().required(),
    teacherId: yup.string().required(),
    subjectId: yup.string().required(),
    cpmk: yup
      .array()
      .of(
        yup.object().shape({
          description: yup.string().required(),
          cpmkCode: yup.string().required(),
          totalGradingWeight: yup.number().positive().required(),
          supportedCplIds: yup.array().of(yup.string()).required(),
        })
      )
      .required(),
    meetingPlan: yup
      .array()
      .of(
        yup.object().shape({
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
      )
      .required(),
    studentAssignmentPlan: yup
      .array()
      .of(
        yup.object().shape({
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
      )
      .required(),
  })
  .noUnknown();

export default createRpsSchema;
