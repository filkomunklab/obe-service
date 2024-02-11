import { SubjectType } from "@prisma/client";
import * as yup from "yup";

const curriculumSchema = yup.array().of(
  yup
    .object()
    .shape({
      code: yup.string().required(),
      indonesiaName: yup.string().required(),
      englishName: yup.string().required(),
      credits: yup.number().required(),
      type: yup.string().oneOf(Object.values(SubjectType)).required(),
      prerequisite: yup.array().of(yup.string()).optional().nullable(),
      semester: yup.number().required(),
    })
    .noUnknown()
);

export default curriculumSchema;
