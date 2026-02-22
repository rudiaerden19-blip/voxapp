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

// POST: Zoek relevante kennis voor een vraag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, query, match_count = 5, match_threshold = 0.7 } = body;

    if (!business_id || !query) {
      return NextResponse.json(
        { error: 'business_id and query are required' },
        { status: 400 }
      );
    }

    const openai = getOpenAI();
    const supabase = getSupabase();

    // Genereer embedding voor de zoekvraag
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Zoek in database met vector similarity
    const { data, error } = await supabase.rpc('search_knowledge', {
      p_business_id: business_id,
      p_query_embedding: queryEmbedding,
      p_match_threshold: match_threshold,
      p_match_count: match_count,
    });

    if (error) throw error;

    // Format resultaten voor AI context
    const context = data
      .map((item: { title: string; content: string; similarity: number }) => 
        `[${item.title}]: ${item.content}`
      )
      .join('\n\n');

    return NextResponse.json({
      results: data,
      context,
      count: data.length,
    });
  } catch (error) {
    console.error('Error searching knowledge:', error);
    return NextResponse.json({ error: 'Failed to search knowledge' }, { status: 500 });
  }
}
