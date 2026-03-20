import fs from "fs";
import path from "path";
import type { RawJobDescription, RawSalaryRecord, JobRecord } from "./types";

const SALARY_GRADE_KEYS = Array.from(
  { length: 14 },
  (_, i) => `Salary grade ${i + 1}` as keyof RawSalaryRecord,
);

export function loadJobData(): JobRecord[] {
  const dataDir = path.join(process.cwd(), "data");

  const jobs: RawJobDescription[] = JSON.parse(
    fs.readFileSync(path.join(dataDir, "job-descriptions.json"), "utf-8"),
  );

  const salaries: RawSalaryRecord[] = JSON.parse(
    fs.readFileSync(path.join(dataDir, "salaries.json"), "utf-8"),
  );

  const salaryMap = new Map<string, RawSalaryRecord>();
  for (const record of salaries) {
    const key = `${record.Jurisdiction.toLowerCase()}|${record["Job Code"]}`;
    salaryMap.set(key, record);
  }

  return jobs.map((job) => {
    const key = `${job.jurisdiction.toLowerCase()}|${job.code}`;
    const salaryRecord = salaryMap.get(key);

    const salaryGrades = salaryRecord
      ? SALARY_GRADE_KEYS.map((k) => (salaryRecord[k] as string) ?? "")
          .filter((v) => v.trim() !== "")
          .map((v) => v.trim())
      : [];

    return {
      jurisdiction: job.jurisdiction,
      code: job.code,
      title: job.title,
      description: job.description,
      salaryGrades,
    };
  });
}
