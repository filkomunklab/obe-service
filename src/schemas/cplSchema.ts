import * as yup from "yup";

const cplSchema = yup.array().of(
  yup
    .object()
    .shape({
      code: yup.string().required(),
      description: yup.string().required(),
      curriculumId: yup.string().required(),
    })
    .noUnknown()
);

export default cplSchema;
