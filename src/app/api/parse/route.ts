import { NextResponse } from "next/server";
import { parseScopeWithAI } from "@/lib/openai";
import type { ParseRequest } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ParseRequest;
    if (!body.message?.trim()) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 },
      );
    }

    const { parsed, mode } = await parseScopeWithAI(body);
    return NextResponse.json({ parsed, mode });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Parse failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
