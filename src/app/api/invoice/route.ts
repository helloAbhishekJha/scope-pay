import { NextResponse } from "next/server";
import { createAndSendInvoice } from "@/lib/paypal";
import type { ParsedScope } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const scope = (await request.json()) as ParsedScope;
    if (!scope?.lineItems?.length || !scope.clientEmail) {
      return NextResponse.json(
        { error: "Invalid scope payload" },
        { status: 400 },
      );
    }

    const invoice = await createAndSendInvoice(scope);
    return NextResponse.json({ invoice });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invoice failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
