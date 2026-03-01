# Vercel: Vapi env vars

Voeg deze toe in Vercel → Settings → Environment Variables:

| Name | Value | Gebruik |
|------|-------|---------|
| `VAPI_WEBHOOK_SECRET` | `ede4ecc8680196ce7bafa904bb745965b22de906cbcf7e3e4f69eface03b1ea1` | appointments/save webhook |
| `VAPI_API_KEY` | (uit dashboard.vapi.ai → API Keys) | /api/fix-vapi-phone om nummer te herstellen |

Zonder VAPI_WEBHOOK_SECRET krijgt de webhook 401.
Zonder VAPI_API_KEY werkt /api/fix-vapi-phone niet (run dan lokaal: `node scripts/add-vapi-belgian-number.mjs`).
