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

interface KnowledgeItem {
  category?: string;
  title?: string;
  content: string;
}

// POST: Bulk import sector templates
export async function POST(request: NextRequest) {
  const { isAdmin } = verifyAdminCookie(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sector_type, items } = body as { sector_type: string; items: KnowledgeItem[] };

    if (!sector_type || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'sector_type and items array are required' },
        { status: 400 }
      );
    }

    if (items.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1000 items per request. Split into multiple requests.' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const results: { id: string; title: string }[] = [];
    const errors: { index: number; error: string }[] = [];

    // Process in batches of 20
    const BATCH_SIZE = 20;
    
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      
      // Generate embeddings for batch
      const embeddingPromises = batch.map(async (item, idx) => {
        try {
          const embedding = await getEmbedding(item.content);
          return { index: i + idx, embedding, item };
        } catch {
          return { index: i + idx, embedding: null, item };
        }
      });

      const embeddingResults = await Promise.all(embeddingPromises);

      // Insert items with embeddings
      for (const result of embeddingResults) {
        if (!result.embedding) {
          errors.push({ index: result.index, error: 'Failed to generate embedding' });
          continue;
        }

        const { data, error } = await supabase
          .from('sector_templates')
          .insert({
            sector_type,
            category: result.item.category || 'algemeen',
            title: result.item.title || result.item.content.substring(0, 100),
            content: result.item.content,
            embedding: result.embedding,
            is_active: true,
          })
          .select('id, title')
          .single();

        if (error) {
          errors.push({ index: result.index, error: error.message });
        } else if (data) {
          results.push(data);
        }
      }

      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < items.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return NextResponse.json({
      success: results.length,
      failed: errors.length,
      total: items.length,
      errors: errors.slice(0, 10), // Only return first 10 errors
    });
  } catch (error) {
    console.error('Error bulk importing:', error);
    return NextResponse.json({ error: 'Failed to bulk import' }, { status: 500 });
  }
}
