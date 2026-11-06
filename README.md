# ScopePay

**Deliverable → Milestone Pay** for video freelancers — PayPal AI Hackathon 2026 matrix **4.7 FastCut lane**.

ScopePay maps **creator deliverable templates** (reel bundle, ad cut, podcast clips) to a **milestone checklist**, a **Statement of Work (markdown)**, and **two PayPal sandbox invoices**: **40% deposit on kickoff** and **60% balance on final delivery**. The UI shows **two invoice IDs and statuses** (or clearly labeled `DEMO-INV-*` IDs when sandbox creds are missing).

- **Hackathon:** [PayPal AI Hackathon on Devpost](https://paypalaihackathon.devpost.com/)
- **Differentiation:** Milestone billing + deliverable checklist — not a generic “chat → one invoice” clone.

## Judge quick start

**Zero API keys** — demo mode uses fixtures and fake PayPal IDs.

```bash
git clone https://github.com/helloAbhishekJha/scope-pay.git
cd scope-pay
npm install
cp .env.example .env.local   # optional; leave keys empty for demo
npm run dev
```

Open **http://127.0.0.1:4419**

### 60-second demo (two milestone invoice IDs)

| Step | Action | What judges should see |
|------|--------|------------------------|
| 1 | Choose **Reel bundle** (or any preset) | Package + brief prefilled |
| 2 | Click **Run judge demo fixture** | SOW + **milestone checklist** (deposit 40% / balance 60%) |
| 3 | **Create & send deposit invoice** | ID like `DEMO-INV-DEPOSIT-*`, status **SENT**, “PayPal demo mode” badge |
| 4 | **Create & send balance invoice** | ID like `DEMO-INV-BALANCE-*`, status **SENT** |
| 5 | (Optional) **Refresh status** on either card | Stays **SENT** in demo |

**Full sandbox path:** set PayPal env vars below, click **Generate SOW + milestones** (needs `OPENAI_API_KEY` for live copy), send both milestone invoices — IDs come from PayPal sandbox.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | Live LLM SOW + line items. Without it, structured **demo fixture** parsing is used. |
| `OPENAI_BASE_URL` | No | Default `https://api.openai.com/v1` (any OpenAI-compatible API). |
| `OPENAI_MODEL` | No | Default `gpt-4o-mini`. |
| `PAYPAL_CLIENT_ID` | For live invoices | Sandbox app from [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox). |
| `PAYPAL_CLIENT_SECRET` | For live invoices | Sandbox secret. |
| `PAYPAL_MODE` | No | `sandbox` (default) or `live` (not used for hackathon). |
| `PAYPAL_INVOICER_EMAIL` | Recommended | Sandbox **business** account email on the invoice. |
| `PAYPAL_INVOICER_NAME` | No | Display name for invoicer. |

Never commit secrets. Use `.env.local` locally and platform env vars when deployed.

### PayPal sandbox setup

1. Create a **Sandbox Business** and **Sandbox Personal** account at [developer.paypal.com](https://developer.paypal.com/).
2. Create a **REST app** (Sandbox) and copy Client ID + Secret.
3. Set `PAYPAL_INVOICER_EMAIL` to your sandbox business login email.
4. Use a sandbox personal email as the **client email** in the UI so `send_to_recipient` delivers to a test inbox.

**Integration:** OAuth2 client credentials → [`/v2/invoicing/invoices`](https://developer.paypal.com/docs/api/invoicing/v2/) create draft → `/send` **twice** (deposit + balance milestone line items). No PayPal MCP required for this MVP; REST keeps judge setup to env vars only.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server on **http://127.0.0.1:4419** |
| `npm run build` | Production build |
| `npm run start` | Production server (`PORT` from host, default **4419**) |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## Deploy on Render

**Blueprint (recommended):** connect repo and use [`render.yaml`](./render.yaml) — Web Service, Node, build `npm install && npm run build`, start `npm run start`.

**Manual dashboard:**

| Setting | Value |
|---------|--------|
| Type | Web Service |
| Runtime | Node |
| Build | `npm install && npm run build` |
| Start | `npm run start` |
| Env | Same table as above (`sync: false` secrets in dashboard) |

Helper: `./scripts/deploy-render.sh` prints the same checklist.

## Judge test flow (≤3 min video outline)

1. Problem: creators lose time to **scope + billing**, not just editing (FastCut wedge).
2. Show **deliverable template** + authentic brief.
3. **Milestone checklist** + SOW markdown copy.
4. Two PayPal **invoice IDs** on screen (deposit + balance) + status refresh.
5. Mention sandbox + Devpost alignment.

## Devpost alignment

- **PayPal:** Central — two sandbox invoicing create + send flows with visible artifact IDs.
- **AI:** Parses deliverables → SOW + package line items + **40/60 milestone split** (live OpenAI or documented demo fixture).
- **Public repo:** MIT license, run instructions, env-based secrets.

## Architecture

```text
Brief + preset → POST /api/parse → SOW + package line items + milestones (40/60)
                → POST /api/invoice { scope, milestoneId: deposit|balance }
                → PayPal OAuth + create + send (per milestone)
                → GET /api/invoice/status?id=… → refresh status
```

## Releases

- **v0.2.0** — Milestone pay on `main` (judge quick start, Render blueprint, demo two-invoice path).
- **v0.1.0** — Matrix 4.7 milestone billing (deposit + balance invoices, checklist UI).
- **v0.0.0** — Initial SOW → single invoice MVP.

## License

MIT — see [LICENSE](./LICENSE).
