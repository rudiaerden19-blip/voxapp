#!/bin/bash
# Vapi boek_afspraak tool configureren via API
# Gebruik: ./scripts/vapi-boek-afspraak-tool.sh
#
# Vereist: VAPI_API_KEY en VAPI_WEBHOOK_SECRET (of in .env.local)

set -e
VAPI_API_KEY="${VAPI_API_KEY:-}"
WEBHOOK_SECRET="${VAPI_WEBHOOK_SECRET:-}"

# Optioneel: laad uit .env.local
if [ -f .env.local ]; then
  set -a
  source .env.local 2>/dev/null || true
  set +a
fi

if [ -z "$VAPI_API_KEY" ]; then
  echo "VAPI_API_KEY niet gezet. Haal op: https://dashboard.vapi.ai → API Keys"
  exit 1
fi

if [ -z "$WEBHOOK_SECRET" ]; then
  echo "VAPI_WEBHOOK_SECRET niet gezet. Zelfde waarde als in Vercel env."
  exit 1
fi

# Tool definitie voor boek_afspraak
TOOL_JSON=$(cat <<EOF
{
  "type": "function",
  "function": {
    "name": "boek_afspraak",
    "description": "Boek een afspraak voor de klant. Gebruik na het verzamelen van naam, datum, tijdstip en dienst.",
    "parameters": {
      "type": "object",
      "properties": {
        "naam": { "type": "string", "description": "Volledige naam van de klant" },
        "dienst": { "type": "string", "description": "Type behandeling / dienst" },
        "datum": { "type": "string", "description": "Datum (vandaag, morgen, maandag, of YYYY-MM-DD)" },
        "tijdstip": { "type": "string", "description": "Tijdstip (bijv. 10, 14u30)" }
      },
      "required": ["naam", "datum", "tijdstip"]
    }
  },
  "server": {
    "url": "https://www.voxapp.tech/api/appointments/save",
    "headers": {
      "x-webhook-secret": "$WEBHOOK_SECRET"
    }
  }
}
EOF
)

echo "Tool aanmaken..."
RESP=$(curl -s -w "\n%{http_code}" -X POST "https://api.vapi.ai/tool" \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$TOOL_JSON")

HTTP_CODE=$(echo "$RESP" | tail -n1)
BODY=$(echo "$RESP" | sed '$d')

if [ "$HTTP_CODE" != "201" ]; then
  echo "Fout (HTTP $HTTP_CODE): $BODY"
  exit 1
fi

TOOL_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Tool aangemaakt: $TOOL_ID"

echo ""
echo "Volgende stappen:"
echo "1. Ga in Vapi naar Assistants → VoxApp Kapper EU → tab Tools"
echo "2. Verwijder de oude boek_afspraak (x) als die verkeerd geconfigureerd is"
echo "3. Klik 'Add Tool' → 'From Library' → zoek 'boek_afspraak'"
echo "   Of maak een Custom Tool met:"
echo "   - Server URL: https://www.voxapp.tech/api/appointments/save"
echo "   - Header: x-webhook-secret = $WEBHOOK_SECRET"
echo "   - Parameters: naam, dienst, datum, tijdstip"
echo ""
echo "4. Zet in VoxApp AI-instellingen je Vapi Assistant ID (uit de URL)"
