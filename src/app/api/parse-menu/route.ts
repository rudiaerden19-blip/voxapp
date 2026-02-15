import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY niet ingesteld' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Geen bestand ontvangen' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Send image to Gemini
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      {
        text: `Je ziet een menukaart of prijslijst van een snackbar/frituur/restaurant.

OPDRACHT: Lees ELK product en zijn prijs APART. Elk product staat op een eigen regel met puntjes of spaties naar de prijs.

REGELS:
1. Lees ALLEEN de productnaam (links) en prijs (rechts getal met komma of punt)
2. ELK product is EEN apart item - MIX NOOIT producten samen
3. Negeer koppen zoals "SNACKS", "MENU", etc.
4. Prijzen zijn meestal tussen 1.00 en 10.00 euro

FORMAAT - Geef ALLEEN deze JSON array terug, niets anders:
[{"name": "Frikandel", "price": 2.40}, {"name": "Frikandel special", "price": 3.60}]

VOORBEELD wat je ziet:
"Frikandel...............2,40"
"Frikandel special.......3,60"

Wordt:
[{"name": "Frikandel", "price": 2.40}, {"name": "Frikandel special", "price": 3.60}]

Nu jij - lees ALLE producten uit de afbeelding:`,
      },
    ]);

    const response = result.response;
    const content = response.text();
    
    // Parse JSON from response
    let products: { name: string; price: number }[] = [];
    try {
      // Extract JSON array from response (might have markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        products = JSON.parse(jsonMatch[0]);
        // Ensure prices are numbers
        products = products.map(p => ({
          name: String(p.name).trim(),
          price: typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(',', '.')),
        })).filter(p => p.name && !isNaN(p.price) && p.price > 0);
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', content);
      return NextResponse.json({ error: 'Kon producten niet herkennen', products: [] });
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Parse menu error:', error);
    return NextResponse.json({ error: 'Verwerking mislukt' }, { status: 500 });
  }
}
