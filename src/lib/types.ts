export type LineItem = {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
};

export type MilestoneId = "deposit" | "balance";

export type MilestoneChecklistItem = {
  id: string;
  label: string;
};

export type PaymentMilestone = {
  id: MilestoneId;
  title: string;
  subtitle: string;
  percent: number;
  amount: number;
  currency: string;
  trigger: string;
  lineItems: LineItem[];
  checklist: MilestoneChecklistItem[];
};

export type ParsedScope = {
  projectTitle: string;
  clientName: string;
  clientEmail: string;
  currency: string;
  dueDays: number;
  sowMarkdown: string;
  lineItems: LineItem[];
  revisionCap?: number;
  deliverables?: string[];
  notes?: string;
  packageTotal?: number;
  milestones?: PaymentMilestone[];
};

export type InvoiceResult = {
  invoiceId: string;
  status: string;
  href?: string;
  total: number;
  currency: string;
  demoMode: boolean;
  sentAt?: string;
  milestoneId?: MilestoneId;
  milestoneLabel?: string;
};

export type ParseRequest = {
  message: string;
  presetId?: string;
  clientName?: string;
  clientEmail?: string;
  useDemoFixture?: boolean;
};

export type InvoiceRequest = {
  scope: ParsedScope;
  milestoneId: MilestoneId;
};
