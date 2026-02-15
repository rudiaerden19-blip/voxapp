import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Geen bestand ontvangen' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    // Use GPT-4 Vision to extract products from the image/PDF
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyseer deze menukaart/prijslijst en extraheer alle producten met hun prijzen.
              
Geef het resultaat als JSON array met objecten die "name" en "price" bevatten.
Alleen de JSON array, geen andere tekst.

Voorbeeld output:
[{"name": "Grote friet", "price": 3.50}, {"name": "Frikandel", "price": 2.00}]

Als je geen producten met prijzen kunt vinden, geef dan een lege array: []`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content || '[]';
    
    // Parse the JSON from the response
    let products: { name: string; price: number }[] = [];
    try {
      // Extract JSON from the response (might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        products = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json({ error: 'Kon producten niet herkennen', products: [] }, { status: 200 });
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Parse menu error:', error);
    return NextResponse.json({ error: 'Verwerking mislukt' }, { status: 500 });
  }
}
