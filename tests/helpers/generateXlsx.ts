import * as xlsx from "xlsx";

export default function generateXlsx(jsonData: object[], filename: string) {
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(jsonData, {
    header: Object.keys(jsonData[0]),
  });
  xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  return xlsx.writeFile(workbook, filename, {
    bookType: "xlsx",
    type: "buffer",
  });
}
