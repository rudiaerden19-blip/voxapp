import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyAdminCookie } from '@/lib/adminAuth';

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

// GET: Haal sector templates op
export async function GET(request: NextRequest) {
  const { isAdmin } = verifyAdminCookie(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get('sector');

    const supabase = getSupabase();
    let query = supabase
      .from('sector_templates')
      .select('id, sector_type, category, title, content, created_at')
      .eq('is_active', true)
      .order('category')
      .order('created_at', { ascending: false });

    if (sector) {
      query = query.eq('sector_type', sector);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sector templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST: Voeg sector template toe
export async function POST(request: NextRequest) {
  const { isAdmin } = verifyAdminCookie(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sector_type, category, title, content } = body;

    if (!sector_type || !content) {
      return NextResponse.json(
        { error: 'sector_type and content are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Genereer embedding
    const embedding = await getEmbedding(content);

    const { data, error } = await supabase
      .from('sector_templates')
      .insert({
        sector_type,
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
    console.error('Error adding sector template:', error);
    return NextResponse.json({ error: 'Failed to add template' }, { status: 500 });
  }
}

// DELETE: Verwijder sector template
export async function DELETE(request: NextRequest) {
  const { isAdmin } = verifyAdminCookie(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from('sector_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sector template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
