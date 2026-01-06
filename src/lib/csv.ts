import fs from "node:fs/promises";
import Papa from "papaparse";

export async function readCsvAsJson(filePath: string) {
  const content = await fs.readFile(filePath, "utf-8");

  const parsed = Papa.parse<Record<string, unknown>>(content, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors?.length) {
    throw new Error("CSV parse error: " + parsed.errors[0].message);
  }

  return parsed.data ?? [];
}
