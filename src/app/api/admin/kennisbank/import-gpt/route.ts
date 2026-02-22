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

interface GPTGarageRequest {
  id?: number;
  category?: string;
  brand?: string;
  part?: string;
  action?: string;
  question?: string;
  content?: string;
  title?: string;
}

// POST: Import GPT garage format
export async function POST(request: NextRequest) {
  const { isAdmin } = verifyAdminCookie(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sector_type, data } = body;

    if (!sector_type) {
      return NextResponse.json({ error: 'sector_type is required' }, { status: 400 });
    }

    // Handle both formats: { requests: [...] } or [...]
    const items: GPTGarageRequest[] = data.requests || data;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Data must be an array or have a requests array' }, { status: 400 });
    }

    // Limit per request
    const MAX_ITEMS = 500;
    const itemsToProcess = items.slice(0, MAX_ITEMS);

    const supabase = getSupabase();
    let successCount = 0;
    let errorCount = 0;

    // Process in batches of 20
    const BATCH_SIZE = 20;

    for (let i = 0; i < itemsToProcess.length; i += BATCH_SIZE) {
      const batch = itemsToProcess.slice(i, i + BATCH_SIZE);

      const processedBatch = await Promise.all(
        batch.map(async (item) => {
          try {
            // Transform GPT format to our format
            let title: string;
            let content: string;
            let category: string;

            if (item.question) {
              // GPT garage format
              title = [item.brand, item.part, item.action].filter(Boolean).join(' ');
              content = item.question;
              category = item.category || 'algemeen';
            } else {
              // Standard format
              title = item.title || '';
              content = item.content || '';
              category = item.category || 'algemeen';
            }

            if (!content) return null;

            const embedding = await getEmbedding(content);

            return {
              sector_type,
              category,
              title: title || content.substring(0, 100),
              content,
              embedding,
              is_active: true,
            };
          } catch {
            return null;
          }
        })
      );

      // Insert valid items
      const validItems = processedBatch.filter((item): item is NonNullable<typeof item> => item !== null);

      if (validItems.length > 0) {
        const { error } = await supabase
          .from('sector_templates')
          .insert(validItems);

        if (error) {
          console.error('Insert error:', error);
          errorCount += validItems.length;
        } else {
          successCount += validItems.length;
        }
      }

      errorCount += batch.length - validItems.length;

      // Small delay to avoid rate limits
      if (i + BATCH_SIZE < itemsToProcess.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return NextResponse.json({
      success: successCount,
      failed: errorCount,
      processed: itemsToProcess.length,
      remaining: items.length - itemsToProcess.length,
      message: items.length > MAX_ITEMS 
        ? `Processed first ${MAX_ITEMS} items. ${items.length - MAX_ITEMS} remaining. Call again to continue.`
        : 'All items processed.',
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import' }, { status: 500 });
  }
}
