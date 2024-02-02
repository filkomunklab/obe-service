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
