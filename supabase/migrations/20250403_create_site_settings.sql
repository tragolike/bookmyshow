
-- Create a table for site-wide settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Insert default settings
INSERT INTO public.site_settings (key, value)
VALUES ('hero_overlay_opacity', '60')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous to read site_settings"
  ON public.site_settings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated to read site_settings"
  ON public.site_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admin to modify site_settings"
  ON public.site_settings
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@showtix.com');

-- Fix previous errors by ensuring BookingPage.tsx has proper types
-- Add type for TicketCounter if needed
