export default function parsePrerequisites(prerequisite: string): string[] {
  if (!prerequisite || prerequisite === "") {
    return null; // Return null if no prerequisites are specified
  }

  // Remove the brackets and split the prerequisite string by comma
  return prerequisite
    .slice(1, -1)
    .split(",")
    .map((prerequisite) => prerequisite.trim());
}
