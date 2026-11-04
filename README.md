# ScopePay

**Creator / video deliverable → PayPal sandbox invoice** — CC-16 PayPal AI Hackathon MVP (matrix ideas **4.2** story on **4.1** architecture).

ScopePay turns messy client briefs into a **Statement of Work (markdown)** plus structured **line items**, then **creates and sends a PayPal sandbox invoice** via the REST Invoicing API. The UI surfaces a real **invoice ID and status** (or clearly labeled demo IDs when sandbox creds are missing).

- **Hackathon:** [PayPal AI Hackathon on Devpost](https://paypalaihackathon.devpost.com/)
- **Differentiation:** Preset **video/creator packages** (reel bundle, ad cut, podcast clips) + **SOW export** — not a generic invoice chat clone.

## Quick start (judges)

1. Clone and install:

   ```bash
   git clone https://github.com/helloAbhishekJha/scope-pay.git
   cd scope-pay
   npm install
   cp .env.example .env.local   # optional keys
   npm run dev
   ```

2. Open **http://127.0.0.1:4419**

3. **Demo without any API keys:**
   - Pick a preset package
   - Click **Run judge demo fixture**
   - Review SOW → **Create & send PayPal invoice**
   - Confirm **invoice ID** + **SENT** status (demo mode badge)

4. **Full sandbox path:** add env vars below, use **Generate SOW + line items** with your OpenAI key, then send — IDs come from PayPal sandbox.

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

**Integration:** OAuth2 client credentials → [`/v2/invoicing/invoices`](https://developer.paypal.com/docs/api/invoicing/v2/) create draft → `/send`. No PayPal MCP required for this MVP; REST keeps judge setup to env vars only.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server on port **4419** |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## Judge test flow (≤3 min video outline)

1. Problem: freelancers lose margin to **scope creep** on video gigs.
2. Show **preset package** + authentic brief.
3. AI SOW panel + **Copy markdown**.
4. PayPal **invoice ID** on screen + status refresh.
5. Mention sandbox + Devpost alignment.

## Devpost alignment

- **PayPal:** Central — sandbox invoicing create + send with visible artifact ID.
- **AI:** Parses deliverables → SOW + line items (live OpenAI or documented demo fixture).
- **Public repo:** MIT license, run instructions, env-based secrets.
- **Hosted demo (optional):** Deploy to [Render](https://render.com) — Web Service, Node, build `npm install && npm run build`, start `npm run start -p $PORT`, add env vars in dashboard.

## Architecture

```text
Brief + preset → POST /api/parse → SOW markdown + line items
                → POST /api/invoice → PayPal OAuth + create + send
                → GET /api/invoice/status?id=… → refresh status
```

## License

MIT — see [LICENSE](./LICENSE).
