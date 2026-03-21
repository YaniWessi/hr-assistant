"use server";

import Anthropic from "@anthropic-ai/sdk";
import { loadJobData } from "../lib/data";
import type { JobRecord } from "../lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function scoreRecord(record: JobRecord, messageWords: string[]): number {
  const haystack = `${record.title} ${record.jurisdiction}`.toLowerCase();
  return messageWords.filter((word) => haystack.includes(word)).length;
}

export async function sendMessage(message: string): Promise<string> {
  const allJobs = loadJobData();

  const messageWords = message.toLowerCase().split(/\s+/).filter(Boolean);

  const relevant = allJobs
    .map((record) => ({ record, score: scoreRecord(record, messageWords) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ record }) => record);

  const context = relevant
    .map(
      (r) =>
        `Job: ${r.title}\nJurisdiction: ${r.jurisdiction}\nCode: ${r.code}\nSalary Grades: ${r.salaryGrades.join(", ") || "N/A"}\nDescription:\n${r.description}`,
    )
    .join("\n\n---\n\n");

  const systemPrompt =
    relevant.length > 0
      ? `You are an HR assistant with access to the following job and salary data:\n\n${context}\n\nAnswer the user's question using only this data. Be clear and accurate.`
      : "You are an HR assistant. You do not have data matching the user's query. Nicely let them know.";

  const response = await client.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: message }],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
