import { NextResponse } from "next/server";
import { getInvoiceStatus } from "@/lib/paypal";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get("id");
  if (!invoiceId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  try {
    const status = await getInvoiceStatus(invoiceId);
    return NextResponse.json({ invoiceId, ...status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Status failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
