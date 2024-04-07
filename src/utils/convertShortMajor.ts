export default function convertShortMajor(major: string) {
  switch (major) {
    case "IF":
      return "Informatika";
    case "SI":
      return "Sistem Informasi";
    case "DKV":
      return "Teknologi Informasi";
    default:
      return major;
  }
}
