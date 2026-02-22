-- ============================================
-- KNOWLEDGE BASE voor RAG (AI kennisbank)
-- ============================================

-- Enable pgvector extension voor embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabel: knowledge_base (kennisbank per business)
CREATE TABLE knowledge_base (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Categorie voor organisatie
  category VARCHAR(100), -- 'diensten', 'prijzen', 'faq', 'algemeen', etc.
  
  -- De kennis zelf
  title VARCHAR(255), -- Korte titel voor admin
  content TEXT NOT NULL, -- De volledige kennis tekst
  
  -- Vector embedding voor zoeken
  embedding vector(768), -- Gemini text-embedding-004 is 768 dimensies
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index voor snelle vector search
CREATE INDEX idx_knowledge_base_embedding ON knowledge_base 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Index voor business_id
CREATE INDEX idx_knowledge_base_business_id ON knowledge_base(business_id);

-- RLS
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own knowledge" ON knowledge_base
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own knowledge" ON knowledge_base
  FOR INSERT WITH CHECK (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own knowledge" ON knowledge_base
  FOR UPDATE USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own knowledge" ON knowledge_base
  FOR DELETE USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Service role kan alles (voor API calls)
CREATE POLICY "Service role full access" ON knowledge_base
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger voor updated_at
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SECTOR TEMPLATES (voorgedefinieerde kennis per sector)
-- ============================================

CREATE TABLE sector_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Sector type (moet matchen met businesses.type)
  sector_type VARCHAR(50) NOT NULL, -- 'garage', 'kapsalon', 'frituur', 'tandarts', etc.
  
  -- Template kennis
  category VARCHAR(100),
  title VARCHAR(255),
  content TEXT NOT NULL,
  
  -- Vector embedding
  embedding vector(768),
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sector_templates_sector_type ON sector_templates(sector_type);
CREATE INDEX idx_sector_templates_embedding ON sector_templates 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================
-- FUNCTIE: Kopieer sector templates naar nieuwe business
-- ============================================

CREATE OR REPLACE FUNCTION copy_sector_templates_to_business(
  p_business_id UUID,
  p_sector_type VARCHAR(50)
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  copied_count INTEGER;
BEGIN
  INSERT INTO knowledge_base (business_id, category, title, content, embedding, is_active)
  SELECT 
    p_business_id,
    category,
    title,
    content,
    embedding,
    true
  FROM sector_templates
  WHERE sector_type = p_sector_type
    AND is_active = true;
  
  GET DIAGNOSTICS copied_count = ROW_COUNT;
  RETURN copied_count;
END;
$$;

-- ============================================
-- FUNCTIE: Zoeken in kennisbank (vector similarity)
-- ============================================

CREATE OR REPLACE FUNCTION search_knowledge(
  p_business_id UUID,
  p_query_embedding vector(768),
  p_match_threshold FLOAT DEFAULT 0.7,
  p_match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  category VARCHAR(100),
  title VARCHAR(255),
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kb.id,
    kb.category,
    kb.title,
    kb.content,
    1 - (kb.embedding <=> p_query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE kb.business_id = p_business_id
    AND kb.is_active = true
    AND 1 - (kb.embedding <=> p_query_embedding) > p_match_threshold
  ORDER BY kb.embedding <=> p_query_embedding
  LIMIT p_match_count;
END;
$$;
