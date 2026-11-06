import { NextResponse } from "next/server";
import { scopeForMilestoneInvoice } from "@/lib/milestones";
import { createAndSendInvoice } from "@/lib/paypal";
import type { InvoiceRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InvoiceRequest;
    const scope = body.scope;
    const milestoneId = body.milestoneId;
    if (!scope?.clientEmail || !milestoneId) {
      return NextResponse.json(
        { error: "scope and milestoneId (deposit | balance) are required" },
        { status: 400 },
      );
    }

    const milestoneScope = scopeForMilestoneInvoice(scope, milestoneId);
    const milestone = scope.milestones?.find((m) => m.id === milestoneId);
    const invoice = await createAndSendInvoice(milestoneScope, {
      milestoneId,
      milestoneLabel: milestone?.title,
    });
    return NextResponse.json({ invoice });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invoice failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
