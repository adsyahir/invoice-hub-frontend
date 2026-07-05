/**
 * InvoiceHub AI copilot — mock engine.
 *
 * `streamAssistantReply` is the ONE seam to wire the backend: replace the mock
 * composer with a fetch to a streaming chat endpoint (SSE / ReadableStream) and
 * yield decoded chunks. Everything the UI needs (message shape, streaming) stays
 * the same, so the AssistantPage doesn't change when you swap this out.
 */
import {
  currentTenant,
  mockAgingBuckets,
  mockClients,
  mockDashboardStats,
  mockInvoices,
  mockPayments,
} from "@/lib/mock/data";
import { formatCurrency, formatDate } from "@/lib/format";
import { einvoiceStatusStyle } from "@/lib/status";
import type { EInvoiceStatus } from "@/types";

export type AssistantRole = "user" | "assistant";

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  content: string;
  createdAt: string;
}

export interface AssistantQuery {
  prompt: string;
  /** Prior turns, oldest first — sent as context to the model. */
  history: { role: AssistantRole; content: string }[];
}

/** Prompt chips shown on an empty conversation. */
export const suggestedPrompts = [
  "What invoices are overdue?",
  "Who owes me the most right now?",
  "Summarize this month's revenue",
  "Break down my receivables aging",
  "Explain my MyInvois e-invoice statuses",
] as const;

// ---------------------------------------------------------------------------
// Streaming
// ---------------------------------------------------------------------------

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Stream an assistant reply as text chunks.
 *
 * TODO(backend): replace the body with a real streaming call, e.g.
 *   const res = await fetch("/api/ai/chat", { method: "POST", body: ... });
 *   const reader = res.body!.getReader();
 *   for (;;) { const { value, done } = await reader.read(); if (done) break;
 *              yield new TextDecoder().decode(value); }
 * The mock below fabricates a grounded answer from the workspace fixtures.
 */
export async function* streamAssistantReply(
  q: AssistantQuery,
): AsyncGenerator<string> {
  const full = composeReply(q.prompt);
  // Small "thinking" beat before the first token.
  await delay(250);
  for (const chunk of chunkText(full)) {
    yield chunk;
    await delay(18 + Math.random() * 34);
  }
}

/** Group words into 1–3 word chunks so the stream looks like real generation. */
function chunkText(text: string): string[] {
  const tokens = text.split(/(\s+)/); // keep whitespace tokens
  const chunks: string[] = [];
  let buf = "";
  let words = 0;
  for (const t of tokens) {
    buf += t;
    if (t.trim()) words++;
    if (words >= 2 || t.includes("\n")) {
      chunks.push(buf);
      buf = "";
      words = 0;
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

// ---------------------------------------------------------------------------
// Mock "reasoning" — keyword-routed, grounded in the mock fixtures
// ---------------------------------------------------------------------------

const currency = mockDashboardStats.currency;

function composeReply(prompt: string): string {
  const p = prompt.toLowerCase();

  if (/overdue|late|past due/.test(p)) return overdueReply();
  if (/owe|owed|outstanding|debtor|receivable/.test(p) && !/aging|ageing/.test(p))
    return outstandingReply();
  if (/aging|ageing|bucket/.test(p)) return agingReply();
  if (/revenue|this month|paid|collected|summary|summarize|how.*doing/.test(p))
    return revenueReply();
  if (/myinvois|e-?invoice|lhdn|einvoice|compliance/.test(p))
    return einvoiceReply();
  if (/draft|create|new invoice|make an invoice/.test(p)) return draftReply();
  if (/payment|recent|transaction/.test(p)) return paymentsReply();
  if (/hello|hi\b|hey|help|what can you/.test(p)) return helpReply();

  return fallbackReply(prompt);
}

function overdueReply(): string {
  const overdue = mockInvoices
    .filter((i) => i.status === "OVERDUE")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  if (overdue.length === 0) {
    return "Good news — you have no overdue invoices right now. Everything that's been sent is either paid or still within its payment terms.";
  }
  const total = overdue.reduce((s, i) => s + i.amountDue, 0);
  const lines = overdue
    .map(
      (i) =>
        `  • ${i.invoiceNumber} — ${i.client?.name ?? "Unknown"} — ${formatCurrency(
          i.amountDue,
          i.currency,
        )} (due ${formatDate(i.dueDate)})`,
    )
    .join("\n");
  return `You have ${overdue.length} overdue invoice${
    overdue.length === 1 ? "" : "s"
  } totalling ${formatCurrency(total, currency)}:\n\n${lines}\n\nWant me to draft a reminder email for the oldest one, or send a payment link?`;
}

function outstandingReply(): string {
  const byClient = new Map<string, number>();
  for (const i of mockInvoices) {
    if (i.amountDue > 0 && !["VOID", "PAID"].includes(i.status)) {
      const name = i.client?.name ?? "Unknown";
      byClient.set(name, (byClient.get(name) ?? 0) + i.amountDue);
    }
  }
  const ranked = [...byClient.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (ranked.length === 0)
    return "Nothing outstanding — every issued invoice has been settled. 🎉";
  const total = [...byClient.values()].reduce((s, n) => s + n, 0);
  const lines = ranked
    .map(([name, amt], idx) => `  ${idx + 1}. ${name} — ${formatCurrency(amt, currency)}`)
    .join("\n");
  return `Total outstanding across all clients is ${formatCurrency(
    total,
    currency,
  )}. Your largest balances:\n\n${lines}\n\nI can open any of these clients or draft a statement of account.`;
}

function agingReply(): string {
  const total = mockAgingBuckets.reduce((s, b) => s + b.amount, 0);
  const lines = mockAgingBuckets
    .map(
      (b) =>
        `  • ${b.bucket.padEnd(11)} ${formatCurrency(b.amount, currency)} (${b.count} invoice${
          b.count === 1 ? "" : "s"
        })`,
    )
    .join("\n");
  const overdueAmt = mockAgingBuckets
    .filter((b) => b.bucket !== "Current")
    .reduce((s, b) => s + b.amount, 0);
  const pct = total > 0 ? Math.round((overdueAmt / total) * 100) : 0;
  return `Here's your receivables aging (total ${formatCurrency(
    total,
    currency,
  )}):\n\n${lines}\n\n${pct}% of your receivables are past due. The 90+ day bucket is the one to chase first — those are most at risk of becoming bad debt.`;
}

function revenueReply(): string {
  const s = mockDashboardStats;
  const arrow = (n: number) => (n >= 0 ? "▲" : "▼");
  return `Here's how this month is tracking:\n\n  • Invoiced: ${formatCurrency(
    s.totalInvoiced,
    currency,
  )} (${arrow(s.invoicedChange)} ${Math.abs(s.invoicedChange)}% vs last month)\n  • Collected: ${formatCurrency(
    s.totalPaid,
    currency,
  )} (${arrow(s.paidChange)} ${Math.abs(s.paidChange)}%)\n  • Outstanding: ${formatCurrency(
    s.outstanding,
    currency,
  )}\n  • Overdue: ${formatCurrency(s.totalOverdue, currency)} across ${s.overdueCount} invoice${
    s.overdueCount === 1 ? "" : "s"
  }\n\nCollection rate is about ${
    s.totalInvoiced > 0 ? Math.round((s.totalPaid / s.totalInvoiced) * 100) : 0
  }% of what you invoiced. Want the full aging breakdown?`;
}

function einvoiceReply(): string {
  const counts = new Map<EInvoiceStatus, number>();
  for (const i of mockInvoices) {
    const st = i.einvoiceStatus ?? "NOT_SUBMITTED";
    counts.set(st, (counts.get(st) ?? 0) + 1);
  }
  const order: EInvoiceStatus[] = [
    "VALIDATED",
    "PENDING",
    "REJECTED",
    "NOT_SUBMITTED",
    "CANCELLED",
  ];
  const lines = order
    .filter((st) => counts.get(st))
    .map((st) => `  • ${einvoiceStatusStyle[st].label}: ${counts.get(st)}`)
    .join("\n");
  return `Your LHDN MyInvois status across all invoices:\n\n${lines}\n\nAnything in "Rejected" needs attention — usually a buyer TIN that didn't validate. Drafts stay "Not submitted" until you send them to MyInvois from the invoice page. ${currentTenant.name}'s supplier TIN is ${currentTenant.tin ?? "not set yet"}.`;
}

function paymentsReply(): string {
  const recent = [...mockPayments]
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
    .slice(0, 5);
  const lines = recent
    .map(
      (pay) =>
        `  • ${formatDate(pay.paidAt)} — ${pay.clientName ?? pay.invoiceNumber} — ${formatCurrency(
          pay.amount,
          pay.currency,
        )} (${pay.method})`,
    )
    .join("\n");
  return `Your five most recent payments:\n\n${lines}\n\nWant me to record a new offline payment, or open the payments page?`;
}

function helpReply(): string {
  return `I'm your InvoiceHub copilot. I can see this workspace's invoices, clients, payments and MyInvois status, so ask me things like:\n\n  • "What's overdue and who do I chase first?"\n  • "Who owes me the most?"\n  • "How's revenue this month?"\n  • "Break down my receivables aging"\n  • "Explain my e-invoice statuses"\n\nWhat would you like to look at?`;
}

function draftReply(): string {
  const client = mockClients[0];
  return `Sure — I can pre-fill a draft. Based on your recent invoices, a typical one for ${client.name} runs on Net ${client.paymentTermsDays} terms with 8% SST.\n\nTell me the client and the line items (description, qty, unit price) and I'll set it up, or head to Invoices → New and I'll follow along. Note: totals are finalized server-side when the invoice is saved.`;
}

function fallbackReply(prompt: string): string {
  return `I can help with that in the context of your invoicing — I have visibility into invoices, clients, payments, receivables aging and LHDN MyInvois status for ${currentTenant.name}.\n\nCould you point me at one of those? For example, try "what's overdue", "who owes me the most", or "summarize this month". (You asked: "${prompt.trim()}")`;
}
