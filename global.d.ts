import { SubjectType } from "@prisma/client";

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
