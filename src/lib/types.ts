export type LineItem = {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
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
};

export type InvoiceResult = {
  invoiceId: string;
  status: string;
  href?: string;
  total: number;
  currency: string;
  demoMode: boolean;
  sentAt?: string;
};

export type ParseRequest = {
  message: string;
  presetId?: string;
  clientName?: string;
  clientEmail?: string;
  useDemoFixture?: boolean;
};
