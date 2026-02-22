import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// GET: Haal alle kennis op voor een business
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id, category, title, content, is_active, created_at')
      .eq('business_id', businessId)
      .order('category', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching knowledge:', error);
    return NextResponse.json({ error: 'Failed to fetch knowledge' }, { status: 500 });
  }
}

// POST: Voeg nieuwe kennis toe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, category, title, content } = body;

    if (!business_id || !content) {
      return NextResponse.json(
        { error: 'business_id and content are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Genereer embedding met Gemini
    const embedding = await getEmbedding(content);

    // Sla op in database
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert({
        business_id,
        category: category || 'algemeen',
        title: title || content.substring(0, 100),
        content,
        embedding,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding knowledge:', error);
    return NextResponse.json({ error: 'Failed to add knowledge' }, { status: 500 });
  }
}

// DELETE: Verwijder kennis
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting knowledge:', error);
    return NextResponse.json({ error: 'Failed to delete knowledge' }, { status: 500 });
  }
}
