
-- Create brand_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.brand_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'ShowTix',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#ff3366',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create storage bucket for brand assets if it doesn't exist
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'brand_assets') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('brand_assets', 'Brand Assets', true);
  END IF;
END;
