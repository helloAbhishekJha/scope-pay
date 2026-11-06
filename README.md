# ScopePay

**Deliverable → Milestone Pay** for video freelancers — PayPal AI Hackathon 2026 matrix **4.7 FastCut lane**.

ScopePay maps **creator deliverable templates** (reel bundle, ad cut, podcast clips) to a **milestone checklist**, a **Statement of Work (markdown)**, and **two PayPal sandbox invoices**: **40% deposit on kickoff** and **60% balance on final delivery**. The UI shows **two invoice IDs and statuses** (or clearly labeled `DEMO-INV-*` IDs when sandbox creds are missing).

- **Hackathon:** [PayPal AI Hackathon on Devpost](https://paypalaihackathon.devpost.com/)
- **Differentiation:** Milestone billing + deliverable checklist — not a generic “chat → one invoice” clone.

## Quick start (judges)

1. Clone and install:

   ```bash
   git clone https://github.com/helloAbhishekJha/scope-pay.git
   cd scope-pay
   git checkout feature/4.7-milestone-pay
   npm install
   cp .env.example .env.local   # optional keys
   npm run dev
   ```

2. Open **http://127.0.0.1:4419**

3. **Demo without any API keys:**
   - Pick a preset package
   - Click **Run judge demo fixture**
   - Review SOW + **milestone checklist**
   - **Create & send deposit invoice** → note `DEMO-INV-DEPOSIT-*`
   - **Create & send balance invoice** → note `DEMO-INV-BALANCE-*`
   - Confirm both show **SENT** status

4. **Full sandbox path:** add env vars below, use **Generate SOW + milestones** with your OpenAI key, then send both milestone invoices — IDs come from PayPal sandbox.

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
4. Use a sandbox personal email as the **client email** in the UI (or in the brief) so `send_to_recipient` delivers to a test inbox.

**Integration:** OAuth2 client credentials → [`/v2/invoicing/invoices`](https://developer.paypal.com/docs/api/invoicing/v2/) create draft → `/send` **twice** (deposit + balance milestone line items). No PayPal MCP required for this MVP; REST keeps judge setup to env vars only.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server on port **4419** |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

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
- **Hosted demo (optional):** Deploy to [Render](https://render.com) — Web Service, Node, build `npm install && npm run build`, start `npm run start -p $PORT`, add env vars in dashboard.

## Architecture

```text
Brief + preset → POST /api/parse → SOW + package line items + milestones (40/60)
                → POST /api/invoice { scope, milestoneId: deposit|balance }
                → PayPal OAuth + create + send (per milestone)
                → GET /api/invoice/status?id=… → refresh status
```

## Release

- **v0.1.0** — Matrix 4.7 milestone billing (deposit + balance invoices, checklist UI).

## License

MIT — see [LICENSE](./LICENSE).
