# Eigen nummer behouden – zo werkt het

Een klant (bijv. een frituur) heeft al een jaar zijn eigen telefoonnummer en wil VoxApp gaan gebruiken **zonder dat nummer op te geven**. Dat kan: hij houdt zijn nummer bij zijn huidige provider en schakelt alleen de oproepen door naar VoxApp.

---

## Principe

- De klant **behoudt** zijn nummer bij zijn provider (Proximus, Orange, Telenet, mobiel, enz.).
- Hij stelt **doorschakeling** in: oproepen naar zijn nummer worden doorgestuurd naar **een VoxApp-poolnummer**.
- VoxApp herkent via de **Diversion**-header welk klantnummer gebeld werd en verbindt het gesprek met de juiste AI-receptionist (ElevenLabs agent van die klant).

Er is **geen porting** (nummer meenemen naar een andere provider) nodig. Alleen doorschakelen.

---

## Stappen voor jullie (VoxApp)

### 1. Klant aanmaken

- Klant registreert zich (of jullie maken hem aan in het dashboard).
- Zorg dat het **business** in Supabase staat en gekoppeld is aan een **ElevenLabs agent** (zoals bij andere klanten).

### 2. Doorschakelnummer toevoegen

- Ga naar **Dashboard → Telefoon → Doorschakeling** (of `/dashboard/forwarding`) **als die klant**,  
  **of** gebruik de API als admin:

```bash
POST /api/forwarding
Content-Type: application/json

{
  "business_id": "<uuid van de frituur>",
  "phone_number": "+32XXXYYYYYY",
  "forwarding_type": "no_answer"
}
```

- `phone_number` = het **eigen nummer van de frituur** (zoals het bij de provider geregistreerd staat, bijv. +32 4XX …).
- `forwarding_type`:  
  - `all` = altijd doorsturen  
  - `no_answer` = alleen doorsturen als niet opgenomen (aan te raden)  
  - `busy` = als bezet  
  - `unavailable` = als niet bereikbaar  

Het systeem koppelt dit nummer aan een **poolnummer** (Telnyx) en slaat het op in `forwarding_numbers`.

### 3. Instructies aan de klant geven

Na het toevoegen geeft de API (of het dashboard) **instructies** terug. Die geef je aan de frituur:

**Voorbeeld (bij "niet opnemen"):**

- Doorschakelen als u niet opneemt:  
  1. Bel **\*\*61\*32XXXXXXXX#** op de telefoon die aan dat nummer gekoppeld is.  
  2. Oproepen die niet worden beantwoord gaan naar de AI.  
- Om te annuleren: **##61#**

*(Het echte poolnummer staat in de response; formaat is zonder +, bijv. 32480210449.)*

- **Belangrijk:** De frituur moet deze code bellen **met de telefoon/lijn waarop zijn zaaknummer staat**. Dan zet zijn provider de doorschakeling op dat nummer.

---

## Wat de klant (frituur) doet

1. **Contract bij jullie** – Abonnement VoxApp (Starter/Pro/Business) en inloggen in het dashboard.
2. **Zijn eigen nummer toevoegen** – In het dashboard onder Telefoon → Doorschakeling zijn nummer invullen (of jullie voegen het voor hem toe).
3. **Code bellen** – De ontvangen code (bijv. **61*32…) bellen **met de telefoon/lijn van zijn zaak**. Daarmee activeert hij bij zijn provider de doorschakeling naar jullie poolnummer.
4. **Klaar** – Bellen klanten zijn zaaknummer, de provider stuurt door naar VoxApp, en de AI neemt op.

---

## Technisch (voor jullie)

- **Telnyx** – Poolnummers ontvangen de doorgestuurde oproep. De webhook (`/api/telnyx/webhook`) krijgt de call; uit de **Diversion**-header halen jullie het oorspronkelijke nummer.
- **forwarding_numbers** – Look-up op dat nummer → `business_id` → juiste ElevenLabs `agent_id` → gesprek doorverbinden naar ElevenLabs.
- Zonder **Diversion** kan de app niet weten welke klant gebeld werd. De meeste providers zetten die header standaard bij doorschakeling; anders moet de klant bij de provider navragen of “doorschakeling met meesturen oorspronkelijk nummer” mogelijk is.

---

## Samenvatting voor de frituur

| Stap | Actie |
|------|--------|
| 1 | VoxApp-abonnement nemen en inloggen. |
| 2 | In dashboard: eigen telefoonnummer (zaak) toevoegen bij Doorschakeling. |
| 3 | Ontvangen code bellen **met de telefoon van de zaak**. |
| 4 | Nummer blijft van de frituur; oproepen worden door de AI beantwoord. |

**Geen nummer opgeven, geen porting – alleen doorschakeling instellen.**
