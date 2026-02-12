import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bkjqadaamxmwjeenzslr.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJranFhZGFhbXhtd2plZW56c2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDE4ODYsImV4cCI6MjA4NjQxNzg4Nn0.S150ziiXSs_TH9TsktOTmWuidi9gNwho6naAjZkUjyY',
  },
};

export default nextConfig;
