import type { LineItem, PaymentMilestone, ParsedScope } from "@/lib/types";
import { getPresetById } from "@/lib/packages";

const DEPOSIT_PERCENT = 40;
const BALANCE_PERCENT = 60;

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function computePackageTotal(lineItems: LineItem[]): number {
  return lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
}

function splitChecklist(
  deliverables: string[],
): { deposit: string[]; balance: string[] } {
  if (deliverables.length <= 1) {
    return {
      deposit: ["Kickoff call + asset handoff confirmed"],
      balance: deliverables.length ? deliverables : ["Final deliverables exported"],
    };
  }
  const mid = Math.ceil(deliverables.length / 2);
  return {
    deposit: [
      "Kickoff + scope lock",
      ...deliverables.slice(0, mid),
    ],
    balance: [
      ...deliverables.slice(mid),
      "Final exports delivered to client folder",
    ],
  };
}

export function buildPaymentMilestones(
  scope: Pick<ParsedScope, "lineItems" | "deliverables" | "currency"> & {
    presetId?: string;
    projectTitle?: string;
  },
): PaymentMilestone[] {
  const preset = scope.presetId ? getPresetById(scope.presetId) : undefined;
  const deliverables =
    scope.deliverables?.length
      ? scope.deliverables
      : (preset?.deliverables ?? ["Video deliverables per SOW"]);
  const total = computePackageTotal(scope.lineItems);
  const depositAmount = roundMoney((total * DEPOSIT_PERCENT) / 100);
  const balanceAmount = roundMoney(total - depositAmount);
  const currency = scope.currency || "USD";
  const { deposit: depositChecklist, balance: balanceChecklist } =
    splitChecklist(deliverables);

  const depositLineItems: LineItem[] = [
    {
      name: `Project deposit (${DEPOSIT_PERCENT}%) — kickoff`,
      description: `Milestone 1 of 2 · due on project kickoff · ${scope.projectTitle ?? "video package"}`,
      quantity: 1,
      unitPrice: depositAmount,
    },
  ];

  const balanceLineItems: LineItem[] = [
    {
      name: `Final balance (${BALANCE_PERCENT}%) — on delivery`,
      description: `Milestone 2 of 2 · due when deliverables are accepted`,
      quantity: 1,
      unitPrice: balanceAmount,
    },
  ];

  return [
    {
      id: "deposit",
      title: "Deposit · kickoff",
      subtitle: `${DEPOSIT_PERCENT}% to start editing`,
      percent: DEPOSIT_PERCENT,
      amount: depositAmount,
      currency,
      trigger: "On kickoff (invoice sent now)",
      lineItems: depositLineItems,
      checklist: depositChecklist.map((label, i) => ({
        id: `deposit-${i}`,
        label,
      })),
    },
    {
      id: "balance",
      title: "Balance · delivery",
      subtitle: `${BALANCE_PERCENT}% on final delivery`,
      percent: BALANCE_PERCENT,
      amount: balanceAmount,
      currency,
      trigger: "On final delivery acceptance",
      lineItems: balanceLineItems,
      checklist: balanceChecklist.map((label, i) => ({
        id: `balance-${i}`,
        label,
      })),
    },
  ];
}

export function attachMilestonesToScope(
  scope: ParsedScope,
  presetId?: string,
): ParsedScope {
  const packageTotal = computePackageTotal(scope.lineItems);
  const milestones = buildPaymentMilestones({
    lineItems: scope.lineItems,
    deliverables: scope.deliverables,
    currency: scope.currency,
    presetId,
    projectTitle: scope.projectTitle,
  });
  return { ...scope, packageTotal, milestones };
}

export function getMilestoneById(
  scope: ParsedScope,
  milestoneId: "deposit" | "balance",
): PaymentMilestone | undefined {
  return scope.milestones?.find((m) => m.id === milestoneId);
}

export function scopeForMilestoneInvoice(
  scope: ParsedScope,
  milestoneId: "deposit" | "balance",
): ParsedScope {
  const milestone = getMilestoneById(scope, milestoneId);
  if (!milestone) {
    throw new Error(`Unknown milestone: ${milestoneId}`);
  }
  return {
    ...scope,
    projectTitle: `${scope.projectTitle} — ${milestone.title}`,
    lineItems: milestone.lineItems,
    dueDays: milestoneId === "deposit" ? 7 : scope.dueDays,
    notes:
      scope.notes ??
      `ScopePay milestone invoice (${milestone.percent}% · ${milestone.trigger})`,
  };
}
