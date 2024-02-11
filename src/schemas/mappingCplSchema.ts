import * as yup from "yup";

const mappingCplSchema = yup
  .object()
  .shape({
    id: yup.string().required(),
    cplIds: yup.array().of(yup.string().required()).required(),
  })
  .noUnknown();

export default mappingCplSchema;
