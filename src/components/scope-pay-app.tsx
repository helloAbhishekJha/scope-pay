"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { VIDEO_PACKAGE_PRESETS } from "@/lib/packages";
import type { InvoiceResult, MilestoneId, ParsedScope } from "@/lib/types";
import {
  Check,
  CheckCircle2,
  Circle,
  Copy,
  FileText,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";

type Step = "brief" | "review" | "sent";

export function ScopePayApp() {
  const [presetId, setPresetId] = useState(VIDEO_PACKAGE_PRESETS[0].id);
  const [message, setMessage] = useState(VIDEO_PACKAGE_PRESETS[0].sampleBrief);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [parsed, setParsed] = useState<ParsedScope | null>(null);
  const [parseMode, setParseMode] = useState<"live" | "demo" | null>(null);
  const [invoices, setInvoices] = useState<Partial<Record<MilestoneId, InvoiceResult>>>(
    {},
  );
  const [checklistDone, setChecklistDone] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState<Step>("brief");
  const [loading, setLoading] = useState<
    "parse" | "invoice-deposit" | "invoice-balance" | "refresh" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedPreset = useMemo(
    () => VIDEO_PACKAGE_PRESETS.find((p) => p.id === presetId),
    [presetId],
  );

  const packageTotal = useMemo(() => {
    if (parsed?.packageTotal != null) return parsed.packageTotal;
    if (!parsed) return 0;
    return parsed.lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
  }, [parsed]);

  function applyPreset(id: string) {
    const preset = VIDEO_PACKAGE_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setPresetId(id);
    setMessage(preset.sampleBrief);
    setParsed(null);
    setInvoices({});
    setChecklistDone({});
    setStep("brief");
    setError(null);
  }

  function toggleChecklist(id: string) {
    setChecklistDone((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleParse(useDemoFixture = false) {
    setLoading("parse");
    setError(null);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          presetId,
          clientName: clientName || undefined,
          clientEmail: clientEmail || undefined,
          useDemoFixture,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Parse failed");
      setParsed(data.parsed as ParsedScope);
      setParseMode(data.mode);
      setInvoices({});
      setChecklistDone({});
      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parse failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleSendMilestoneInvoice(milestoneId: MilestoneId) {
    if (!parsed) return;
    setLoading(milestoneId === "deposit" ? "invoice-deposit" : "invoice-balance");
    setError(null);
    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: parsed, milestoneId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invoice failed");
      setInvoices((prev) => ({
        ...prev,
        [milestoneId]: data.invoice as InvoiceResult,
      }));
      setStep("sent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invoice failed");
    } finally {
      setLoading(null);
    }
  }

  async function refreshStatus(milestoneId: MilestoneId) {
    const invoice = invoices[milestoneId];
    if (!invoice?.invoiceId) return;
    setLoading("refresh");
    setError(null);
    try {
      const res = await fetch(
        `/api/invoice/status?id=${encodeURIComponent(invoice.invoiceId)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Refresh failed");
      setInvoices((prev) => {
        const current = prev[milestoneId];
        if (!current) return prev;
        return {
          ...prev,
          [milestoneId]: {
            ...current,
            status: data.status as string,
            href: data.href ?? current.href,
          },
        };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed");
    } finally {
      setLoading(null);
    }
  }

  async function copySow() {
    if (!parsed?.sowMarkdown) return;
    await navigator.clipboard.writeText(parsed.sowMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const milestones = parsed?.milestones ?? [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:px-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">PayPal AI Hackathon 2026</Badge>
          <Badge className="bg-[#0070ba] text-white hover:bg-[#0070ba]">
            Matrix 4.7 · Milestone Pay
          </Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          ScopePay
        </h1>
        <p className="max-w-2xl text-zinc-600">
          FastCut lane for video freelancers: deliverable templates → milestone
          checklist → <strong>deposit + balance PayPal sandbox invoices</strong>{" "}
          tied to kickoff and final delivery—not a generic invoice chatbot.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {VIDEO_PACKAGE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset.id)}
            className={`rounded-xl border p-4 text-left transition hover:border-[#0070ba]/50 hover:shadow-sm ${
              presetId === preset.id
                ? "border-[#0070ba] bg-[#0070ba]/5 ring-1 ring-[#0070ba]/30"
                : "border-zinc-200 bg-white"
            }`}
          >
            <p className="font-medium text-zinc-900">{preset.name}</p>
            <p className="mt-1 text-sm text-zinc-600">{preset.tagline}</p>
            <p className="mt-3 text-sm font-semibold text-[#0070ba]">
              from ${preset.basePrice} {preset.currency}
            </p>
            <p className="mt-1 text-xs text-zinc-500">40% deposit · 60% on delivery</p>
          </button>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-[#0070ba]" />
              1. Describe the deliverable
            </CardTitle>
            <CardDescription>
              Use creator language from your DMs. Pick a preset or paste your
              own brief for {selectedPreset?.name ?? "this package"}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client name (optional)</Label>
                <Input
                  id="clientName"
                  placeholder="Nova Skincare"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client email (optional)</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="billing@client.demo"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brief">Brief</Label>
              <Textarea
                id="brief"
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleParse(false)}
                disabled={loading === "parse"}
              >
                {loading === "parse" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Generate SOW + milestones
              </Button>
              <Button
                variant="outline"
                onClick={() => handleParse(true)}
                disabled={loading === "parse"}
              >
                Run judge demo fixture
              </Button>
            </div>
            {parseMode && (
              <p className="text-sm text-zinc-500">
                Parser mode:{" "}
                <Badge variant="outline">
                  {parseMode === "demo" ? "demo / fixture" : "live LLM"}
                </Badge>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-[#0070ba]" />
              2. Statement of Work
            </CardTitle>
            <CardDescription>
              Export markdown for your client folder. Package line items define
              total; milestones split 40% / 60% into two PayPal invoices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!parsed ? (
              <p className="text-sm text-zinc-500">
                Generate a scope to preview the SOW, checklist, and milestone
                invoices.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{parsed.projectTitle}</p>
                    <p className="text-sm text-zinc-600">
                      {parsed.clientName} · {parsed.clientEmail}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={copySow}>
                    {copied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    Copy markdown
                  </Button>
                </div>
                <ScrollArea className="h-48 rounded-md border bg-zinc-50 p-3">
                  <pre className="whitespace-pre-wrap text-xs text-zinc-800">
                    {parsed.sowMarkdown}
                  </pre>
                </ScrollArea>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Package line items</p>
                  <ul className="space-y-2 text-sm">
                    {parsed.lineItems.map((item) => (
                      <li
                        key={item.name}
                        className="flex justify-between gap-4 rounded-md border bg-white px-3 py-2"
                      >
                        <span>
                          {item.name}{" "}
                          <span className="text-zinc-500">×{item.quantity}</span>
                        </span>
                        <span className="font-medium">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-right text-sm font-semibold">
                    Package total ${packageTotal.toFixed(2)} {parsed.currency}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {parsed && milestones.length > 0 && (
        <section className="grid gap-4 lg:grid-cols-2">
          {milestones.map((milestone) => {
            const sent = invoices[milestone.id];
            return (
              <Card key={milestone.id} className="border-zinc-200">
                <CardHeader>
                  <CardTitle className="text-lg">{milestone.title}</CardTitle>
                  <CardDescription>
                    {milestone.subtitle} · {milestone.trigger}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3">
                    <span className="text-sm text-zinc-600">
                      Milestone invoice amount
                    </span>
                    <span className="text-lg font-semibold text-[#0070ba]">
                      ${milestone.amount.toFixed(2)} ({milestone.percent}%)
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Deliverable checklist</p>
                    <ul className="space-y-2">
                      {milestone.checklist.map((item) => {
                        const done = checklistDone[item.id];
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => toggleChecklist(item.id)}
                              className="flex w-full items-start gap-2 rounded-md border bg-white px-3 py-2 text-left text-sm hover:bg-zinc-50"
                            >
                              {done ? (
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0070ba]" />
                              ) : (
                                <Circle className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                              )}
                              <span className={done ? "text-zinc-500 line-through" : ""}>
                                {item.label}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <Button
                    className="w-full bg-[#0070ba] hover:bg-[#005ea6]"
                    onClick={() => handleSendMilestoneInvoice(milestone.id)}
                    disabled={
                      loading === "invoice-deposit" || loading === "invoice-balance"
                    }
                  >
                    {loading ===
                    (milestone.id === "deposit"
                      ? "invoice-deposit"
                      : "invoice-balance") ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Create &amp; send {milestone.id} invoice
                  </Button>
                  {sent && (
                    <div className="rounded-md border border-[#0070ba]/20 bg-[#0070ba]/5 p-3 text-sm">
                      <p className="text-zinc-600">Invoice ID</p>
                      <p className="font-mono font-semibold">{sent.invoiceId}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge>{sent.status}</Badge>
                        {sent.demoMode && (
                          <Badge variant="outline">PayPal demo mode</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      {step === "sent" &&
        (invoices.deposit || invoices.balance) && (
          <Card className="border-[#0070ba]/30 bg-[#0070ba]/5">
            <CardHeader>
              <CardTitle>3. Milestone PayPal invoices</CardTitle>
              <CardDescription>
                Two sandbox sends — deposit on kickoff, balance on delivery. Demo
                IDs when credentials are missing.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {(["deposit", "balance"] as const).map((id) => {
                const invoice = invoices[id];
                if (!invoice) {
                  return (
                    <div
                      key={id}
                      className="rounded-lg border border-dashed border-zinc-300 bg-white/50 p-4 text-sm text-zinc-500"
                    >
                      {id === "deposit" ? "Deposit" : "Balance"} invoice not sent
                      yet — use the button above.
                    </div>
                  );
                }
                return (
                  <div
                    key={id}
                    className="flex flex-col gap-3 rounded-lg border bg-white p-4"
                  >
                    <p className="font-medium capitalize">{id} milestone</p>
                    <p className="font-mono text-sm">{invoice.invoiceId}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{invoice.status}</Badge>
                      {invoice.demoMode && (
                        <Badge variant="outline">demo mode</Badge>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600">
                      ${invoice.total.toFixed(2)} {invoice.currency}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refreshStatus(id)}
                        disabled={loading === "refresh"}
                      >
                        Refresh
                      </Button>
                      {invoice.href && (
                        <Button
                          variant="secondary"
                          size="sm"
                          render={
                            <a
                              href={invoice.href}
                              target="_blank"
                              rel="noreferrer"
                            />
                          }
                        >
                          Open in PayPal
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
