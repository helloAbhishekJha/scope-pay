import { getPresetById } from "@/lib/packages";
import type { ParsedScope } from "@/lib/types";

function extractEmail(text: string): string | undefined {
  const match = text.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  return match?.[0];
}

function extractClientName(text: string): string | undefined {
  const clientMatch = text.match(/(?:client|bill to|invoice)\s*:?\s*([A-Za-z0-9 &.'-]{2,40})/i);
  if (clientMatch) return clientMatch[1].trim();
  const contactMatch = text.match(/contact\s+([A-Za-z0-9 &.'-]{2,40})/i);
  return contactMatch?.[1]?.trim();
}

export function buildDemoParsedScope(
  message: string,
  presetId?: string,
  overrides?: { clientName?: string; clientEmail?: string },
): ParsedScope {
  const preset = presetId ? getPresetById(presetId) : undefined;
  const clientEmail =
    overrides?.clientEmail ?? extractEmail(message) ?? "client@example.com";
  const clientName =
    overrides?.clientName ??
    extractClientName(message) ??
    (clientEmail.split("@")[0] ?? "Client");

  const lineItems =
    preset?.defaultLineItems.map((item) => ({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })) ?? [
      {
        name: "Video deliverable package",
        description: "Scope parsed from your brief (demo mode)",
        quantity: 1,
        unitPrice: 750,
      },
    ];

  const deliverables =
    preset?.deliverables ??
    message
      .split(/[.\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 12)
      .slice(0, 4);

  const projectTitle = preset
    ? `${preset.name} — ${clientName}`
    : `Video scope — ${clientName}`;

  const total = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const sowMarkdown = `# Statement of Work

**Project:** ${projectTitle}  
**Client:** ${clientName} (${clientEmail})  
**Prepared by:** ScopePay (demo fixture — no live LLM)

## Deliverables

${deliverables.map((d) => `- ${d}`).join("\n")}

## Revision policy

Up to **${preset?.revisionCap ?? 2}** consolidated revision round(s). Additional rounds billed at 15% of package subtotal per round.

## Timeline

Kickoff on deposit; first cut within **5 business days** of asset handoff unless otherwise noted in your brief.

## Investment

| Item | Qty | Unit | Subtotal |
|------|-----|------|----------|
${lineItems
  .map(
    (item) =>
      `| ${item.name} | ${item.quantity} | $${item.unitPrice.toFixed(2)} | $${(item.quantity * item.unitPrice).toFixed(2)} |`,
  )
  .join("\n")}
| **Total** | | | **$${total.toFixed(2)} ${preset?.currency ?? "USD"}** |

## Notes from brief

> ${message.trim().slice(0, 500)}

---

*Generated in **demo mode** (missing \`OPENAI_API_KEY\`). Add your key for AI-authored SOW copy.*
`;

  return {
    projectTitle,
    clientName,
    clientEmail,
    currency: preset?.currency ?? "USD",
    dueDays: 14,
    sowMarkdown,
    lineItems,
    revisionCap: preset?.revisionCap,
    deliverables,
    notes: "Demo fixture parse — structured output for judges without API keys.",
  };
}
