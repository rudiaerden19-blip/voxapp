# Bestellingen op het keukenscherm

## Hoe het werkt

1. **Keukenscherm** (`/dashboard/kitchen`) haalt elke 10 seconden bestellingen op:  
   `GET /api/orders?business_id=...&status=new,preparing,ready`
2. Bestellingen met status **Nieuw** → **In bereiding** → **Klaar** worden getoond in de drie kolommen.
3. Een bestelling komt in de lijst zodra die in de database staat met `status: 'new'` (en bijbehorende `items`).

## Wanneer verschijnen bestellingen?

Bestellingen komen op het keukenscherm als ze worden **aangemaakt via** `POST /api/orders` met o.a.:

- `business_id`, `customer_name`, `customer_phone`
- `items`: array van `{ product_name, quantity, price, options? }`
- `delivery_type`: `'pickup'` of `'delivery'`
- `delivery_time`, `customer_address` (optioneel)
- Status wordt door de API op `'new'` gezet.

Dus:

- **Handmatig** – Iets (eigen backoffice, kassa, andere app) roept `POST /api/orders` aan → bestelling verschijnt op het keukenscherm.
- **Via de AI (telefoon)** – De ElevenLabs-agent moet een **tool/function** hebben “plaats bestelling” die na bevestiging van de klant **onze API aanroept** (`POST /api/orders`). Zonder die koppeling worden telefoonbestellingen **niet** in de database gezet en dus **niet** op het keukenscherm getoond.

## ElevenLabs: bestelling doorgeven aan de app

Om bestellingen van de AI op het keukenscherm te krijgen:

1. In **ElevenLabs** (Conversational AI / Agent): voeg een **Custom Tool** of **Function** toe, bijvoorbeeld `place_order`.
2. Laat de agent die aanroepen wanneer de klant een bestelling bevestigt (met klantnaam, telefoon, items, afhalen/levering, tijd).
3. Die tool moet een HTTP-request doen naar jouw app, bijvoorbeeld:  
   `POST https://<jouw-domein>/api/orders`  
   met body (JSON):  
   `business_id`, `customer_name`, `customer_phone`, `items`, `delivery_type`, `delivery_time`, eventueel `customer_address`, `notes`, `total_amount`.
4. Zodra die POST succesvol is, staat de bestelling in de database met status `new` en wordt ze op het keukenscherm getoond (binnen een refresh van max. 10 seconden).

## Database

De tabel `orders` heeft o.a.:

- `items` (JSONB) – voor de regels op het keukenscherm
- `delivery_type`, `delivery_time`, `customer_address`
- `status`: o.a. `new`, `preparing`, `ready`, `delivered`, `archived`

Migratie `003_orders_kitchen_columns.sql` voegt deze kolommen toe als ze nog ontbreken.

## Samenvatting

- **Keukenscherm** toont wat in `orders` staat met status `new`, `preparing`, `ready`; dat werkt als de tabel de juiste kolommen heeft (migratie gedraaid).
- **Bestellingen komen daar alleen in** als ze worden aangemaakt via `POST /api/orders`.
- **Telefoonbestellingen** komen pas op het keukenscherm als de ElevenLabs-agent zo is geconfigureerd dat die bij “bestelling plaatsen” onze `POST /api/orders` aanroept.
