import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

function getOpenAI() {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error('Missing OpenAI API key');
  }
  return new OpenAI({ apiKey: openaiKey });
}

interface KnowledgeItem {
  category?: string;
  title?: string;
  content: string;
}

// POST: Bulk import kennis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, items } = body as { business_id: string; items: KnowledgeItem[] };

    if (!business_id || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'business_id and items array are required' },
        { status: 400 }
      );
    }

    const openai = getOpenAI();
    const supabase = getSupabase();

    const results: { id: string; title: string }[] = [];
    const errors: { item: KnowledgeItem; error: string }[] = [];

    // Process items in batches of 10 to avoid rate limits
    for (let i = 0; i < items.length; i += 10) {
      const batch = items.slice(i, i + 10);
      
      // Generate embeddings for batch
      const embeddings = await Promise.all(
        batch.map(async (item) => {
          try {
            const response = await openai.embeddings.create({
              model: 'text-embedding-3-small',
              input: item.content,
            });
            return response.data[0].embedding;
          } catch {
            return null;
          }
        })
      );

      // Insert items with embeddings
      for (let j = 0; j < batch.length; j++) {
        const item = batch[j];
        const embedding = embeddings[j];

        if (!embedding) {
          errors.push({ item, error: 'Failed to generate embedding' });
          continue;
        }

        const { data, error } = await supabase
          .from('knowledge_base')
          .insert({
            business_id,
            category: item.category || 'algemeen',
            title: item.title || item.content.substring(0, 100),
            content: item.content,
            embedding,
          })
          .select('id, title')
          .single();

        if (error) {
          errors.push({ item, error: error.message });
        } else if (data) {
          results.push(data);
        }
      }

      // Small delay between batches
      if (i + 10 < items.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return NextResponse.json({
      success: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error('Error bulk importing knowledge:', error);
    return NextResponse.json({ error: 'Failed to bulk import knowledge' }, { status: 500 });
  }
}
