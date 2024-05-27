const checkFileFormat = (value: Blob) => {
  const fileType = value?.type;
  return (
    fileType ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
};

export default checkFileFormat;
