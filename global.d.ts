import {
  Cpmk,
  SubjectType,
  GradingSystem,
  CpmkGrading,
  MeetingPlan,
  StudentAssignmentPlan,
} from "@prisma/client";

declare type CurriculumFile = {
  code: string;
  indonesiaName: string;
  englishName: string;
  credits: number;
  type: SubjectType;
  prerequisite?: string[];
  semester: number;
};

declare type Cpl = {
  code: string;
  description: string;
  curriculumId: string;
};

declare type Subject_Cpl = {
  cplId: string;
  subjectId: string;
};

type NewCpmkGrading = Omit<CpmkGrading, "id" | "rpsId"> & {
  gradingSystem: Pick<GradingSystem, "gradingName" | "gradingWeight">[];
};

declare type CreateRps = {
  teacherId: string;
  subjectId: string;
  subjectFamily: string;
  subjectDescription: string;
  parallel: string;
  semester: number;
  schedule: string;
  rpsDeveloper: string;
  headOfExpertise: string;
  headOfProgramStudy: string;
  cpmk: ({ supportedCplIds: string[] } & Pick<Cpmk, "description" | "code">)[];
  cpmkGrading: NewCpmkGrading[];
  mainReferences: string[];
  supportingReferences: string[];
  software: string;
  hardware: string;
  teamTeaching: string[];
  minPassStudents: string;
  minPassGrade: string;
  meetingPlan: Omit<MeetingPlan, "id" | "rpdsId">[];
  studentAssignmentPlan: Omit<StudentAssignmentPlan, "id" | "rpsId">[];
};
