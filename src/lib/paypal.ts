import type { InvoiceResult, ParsedScope } from "@/lib/types";

function paypalBaseUrl(): string {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function hasPayPalCredentials(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET,
  );
}

export async function getPayPalAccessToken(): Promise<string | null> {
  if (!hasPayPalCredentials()) return null;

  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal OAuth failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("PayPal OAuth missing access_token");
  return json.access_token;
}

function computeTotal(scope: ParsedScope): number {
  return scope.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
}

function formatMoney(value: number): string {
  return value.toFixed(2);
}

function invoiceDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function demoInvoiceId(): string {
  return `DEMO-INV-${Date.now().toString(36).toUpperCase()}`;
}

export async function createAndSendInvoice(
  scope: ParsedScope,
): Promise<InvoiceResult> {
  const total = computeTotal(scope);
  const currency = scope.currency || "USD";

  if (!hasPayPalCredentials()) {
    return {
      invoiceId: demoInvoiceId(),
      status: "SENT",
      total,
      currency,
      demoMode: true,
      sentAt: new Date().toISOString(),
      href: "https://www.sandbox.paypal.com/invoicing/demo",
    };
  }

  const token = await getPayPalAccessToken();
  if (!token) {
    return {
      invoiceId: demoInvoiceId(),
      status: "SENT",
      total,
      currency,
      demoMode: true,
      sentAt: new Date().toISOString(),
    };
  }

  const invoicerEmail =
    process.env.PAYPAL_INVOICER_EMAIL ?? "sb-business@business.example.com";
  const invoicerName = process.env.PAYPAL_INVOICER_NAME ?? "ScopePay Studio";

  const payload = {
    detail: {
      invoice_number: `SP-${Date.now().toString().slice(-8)}`,
      reference: scope.projectTitle.slice(0, 120),
      invoice_date: invoiceDate(),
      currency_code: currency,
      note: scope.notes ?? "ScopePay — creator video deliverable invoice",
      payment_term: {
        term_type: scope.dueDays <= 10 ? "NET_10" : scope.dueDays <= 15 ? "NET_15" : "NET_30",
      },
    },
    invoicer: {
      name: {
        given_name: invoicerName.split(" ")[0] ?? "ScopePay",
        surname: invoicerName.split(" ").slice(1).join(" ") || "Studio",
      },
      email_address: invoicerEmail,
    },
    primary_recipients: [
      {
        billing_info: {
          name: {
            given_name: scope.clientName.split(" ")[0] ?? scope.clientName,
            surname: scope.clientName.split(" ").slice(1).join(" ") || ".",
          },
          email_address: scope.clientEmail,
        },
      },
    ],
    items: scope.lineItems.map((item) => ({
      name: item.name.slice(0, 200),
      description: item.description?.slice(0, 500),
      quantity: String(item.quantity),
      unit_amount: {
        currency_code: currency,
        value: formatMoney(item.unitPrice),
      },
    })),
  };

  const createRes = await fetch(`${paypalBaseUrl()}/v2/invoicing/invoices`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`PayPal create invoice failed (${createRes.status}): ${text}`);
  }

  const created = (await createRes.json()) as {
    id?: string;
    href?: string;
    status?: string;
  };
  const invoiceId = created.id;
  if (!invoiceId) throw new Error("PayPal create invoice missing id");

  const sendRes = await fetch(
    `${paypalBaseUrl()}/v2/invoicing/invoices/${encodeURIComponent(invoiceId)}/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        send_to_invoicer: false,
        send_to_recipient: true,
      }),
    },
  );

  if (!sendRes.ok) {
    const text = await sendRes.text();
    throw new Error(`PayPal send invoice failed (${sendRes.status}): ${text}`);
  }

  const status = await getInvoiceStatus(invoiceId, token);

  return {
    invoiceId,
    status: status.status,
    href: created.href,
    total,
    currency,
    demoMode: false,
    sentAt: new Date().toISOString(),
  };
}

export async function getInvoiceStatus(
  invoiceId: string,
  existingToken?: string,
): Promise<{ status: string; href?: string }> {
  if (invoiceId.startsWith("DEMO-INV-")) {
    return { status: "SENT", href: undefined };
  }

  const token = existingToken ?? (await getPayPalAccessToken());
  if (!token) return { status: "UNKNOWN" };

  const res = await fetch(
    `${paypalBaseUrl()}/v2/invoicing/invoices/${encodeURIComponent(invoiceId)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal get invoice failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as { status?: string; href?: string };
  return { status: json.status ?? "UNKNOWN", href: json.href };
}
