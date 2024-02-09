import * as yup from "yup";

const checkFileFormat = (value: any) => {
  const fileType = value.mimetype;
  return (
    fileType ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
};

const createCurriculumCplSchema = yup
  .object()
  .shape({
    file: yup
      .mixed()
      .required("An xlsx file is required")
      .test("check-file-format", "Unsupported Format", checkFileFormat),
  })
  .noUnknown();

export default createCurriculumCplSchema;
