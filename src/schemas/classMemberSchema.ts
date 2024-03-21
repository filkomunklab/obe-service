import * as yup from "yup";
const classMemberSchema = yup.array().of(
  yup
    .object()
    .shape({
      rpsId: yup.string().required(),
      studentNim: yup.string().required(),
    })
    .noUnknown()
);

export default classMemberSchema;
