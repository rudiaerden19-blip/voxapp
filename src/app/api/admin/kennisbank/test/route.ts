import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyAdminCookie } from '@/lib/adminAuth';

// Test endpoint om alles te diagnosticeren
export async function GET(request: NextRequest) {
  const { isAdmin } = verifyAdminCookie(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
  };

  // 1. Check environment variables
  results.env = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    geminiApiKey: !!process.env.GEMINI_API_KEY,
  };

  // 2. Test Supabase connection
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if sector_templates table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('sector_templates')
      .select('id')
      .limit(1);

    if (tableError) {
      results.supabase = {
        connected: true,
        tableExists: false,
        tableError: tableError.message,
        hint: tableError.hint,
        code: tableError.code,
      };
    } else {
      results.supabase = {
        connected: true,
        tableExists: true,
        existingRows: tableCheck?.length || 0,
      };

      // Try inserting a test record WITHOUT embedding
      const testInsert = await supabase
        .from('sector_templates')
        .insert({
          sector_type: 'test',
          category: 'test',
          title: 'Test item ' + Date.now(),
          content: 'Dit is een test item',
          is_active: true,
        })
        .select();

      if (testInsert.error) {
        results.insertTest = {
          success: false,
          error: testInsert.error.message,
          hint: testInsert.error.hint,
          code: testInsert.error.code,
        };
      } else {
        results.insertTest = {
          success: true,
          insertedId: testInsert.data?.[0]?.id,
        };

        // Clean up test record
        if (testInsert.data?.[0]?.id) {
          await supabase.from('sector_templates').delete().eq('id', testInsert.data[0].id);
        }
      }
    }
  } catch (error) {
    results.supabase = {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // 3. Test Gemini embedding
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      results.gemini = { configured: false };
    } else {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent('Test embedding');
      
      results.gemini = {
        configured: true,
        working: true,
        embeddingSize: result.embedding.values.length,
      };
    }
  } catch (error) {
    results.gemini = {
      configured: true,
      working: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // 4. Test full insert with embedding
  if (results.gemini && (results.gemini as Record<string, unknown>).working && 
      results.supabase && (results.supabase as Record<string, unknown>).tableExists) {
    try {
      const apiKey = process.env.GEMINI_API_KEY!;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const embeddingResult = await model.embedContent('Test met embedding');
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data, error } = await supabase
        .from('sector_templates')
        .insert({
          sector_type: 'test',
          category: 'test',
          title: 'Test met embedding ' + Date.now(),
          content: 'Dit is een test met embedding',
          embedding: embeddingResult.embedding.values,
          is_active: true,
        })
        .select();

      if (error) {
        results.fullInsertTest = {
          success: false,
          error: error.message,
          hint: error.hint,
          code: error.code,
        };
      } else {
        results.fullInsertTest = {
          success: true,
          insertedId: data?.[0]?.id,
        };
        // Clean up
        if (data?.[0]?.id) {
          await supabase.from('sector_templates').delete().eq('id', data[0].id);
        }
      }
    } catch (error) {
      results.fullInsertTest = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return NextResponse.json(results);
}
