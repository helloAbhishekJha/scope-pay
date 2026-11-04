import { buildDemoParsedScope } from "@/lib/demo-fixtures";
import { getPresetById } from "@/lib/packages";
import type { ParsedScope } from "@/lib/types";

const SYSTEM_PROMPT = `You are ScopePay, an assistant for freelance video editors and creators.
Turn a messy client brief into:
1) A professional Statement of Work in markdown (headers, deliverables, revision policy, timeline).
2) Structured PayPal invoice line items tied to video deliverables (not generic consulting).

Respond ONLY with valid JSON matching this schema:
{
  "projectTitle": string,
  "clientName": string,
  "clientEmail": string,
  "currency": "USD",
  "dueDays": number (7-30),
  "sowMarkdown": string (full markdown SOW),
  "lineItems": [{ "name": string, "description": string, "quantity": number, "unitPrice": number }],
  "revisionCap": number,
  "deliverables": string[],
  "notes": string
}

Use realistic USD pricing for creator packages. Line item totals should match the SOW total.`;

export async function parseScopeWithAI(input: {
  message: string;
  presetId?: string;
  clientName?: string;
  clientEmail?: string;
  useDemoFixture?: boolean;
}): Promise<{ parsed: ParsedScope; mode: "live" | "demo" }> {
  const apiKey = process.env.OPENAI_API_KEY;
  const preset = input.presetId ? getPresetById(input.presetId) : undefined;

  if (!apiKey || input.useDemoFixture) {
    return {
      parsed: buildDemoParsedScope(input.message, input.presetId, {
        clientName: input.clientName,
        clientEmail: input.clientEmail,
      }),
      mode: "demo",
    };
  }

  const presetHint = preset
    ? `Selected package preset: ${preset.name} — baseline deliverables: ${preset.deliverables.join("; ")}`
    : "No preset selected — infer deliverables from the brief.";

  const userContent = `${presetHint}

Freelancer brief:
${input.message}

If client name/email missing, infer plausible sandbox demo values.`;

  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned empty content");
  }

  const parsed = JSON.parse(content) as ParsedScope;
  if (!parsed.lineItems?.length || !parsed.sowMarkdown) {
    throw new Error("OpenAI JSON missing required fields");
  }

  if (input.clientName) parsed.clientName = input.clientName;
  if (input.clientEmail) parsed.clientEmail = input.clientEmail;

  return { parsed, mode: "live" };
}
