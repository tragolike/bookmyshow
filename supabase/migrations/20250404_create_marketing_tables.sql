
-- Create special_offers table
CREATE TABLE IF NOT EXISTS public.special_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  discount_percentage INTEGER,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on special_offers
ALTER TABLE public.special_offers ENABLE ROW LEVEL SECURITY;

-- Create weekly_events table
CREATE TABLE IF NOT EXISTS public.weekly_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on weekly_events
ALTER TABLE public.weekly_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
-- Special offers policies
CREATE POLICY "Admin read special_offers"
  ON public.special_offers
  FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('admin@showtix.com', 'admin@example.com', 'ritikpaswal79984@gmail.com'));

CREATE POLICY "Admin insert special_offers"
  ON public.special_offers
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' IN ('admin@showtix.com', 'admin@example.com', 'ritikpaswal79984@gmail.com'));

CREATE POLICY "Admin update special_offers"
  ON public.special_offers
  FOR UPDATE
  USING (auth.jwt() ->> 'email' IN ('admin@showtix.com', 'admin@example.com', 'ritikpaswal79984@gmail.com'));

CREATE POLICY "Admin delete special_offers"
  ON public.special_offers
  FOR DELETE
  USING (auth.jwt() ->> 'email' IN ('admin@showtix.com', 'admin@example.com', 'ritikpaswal79984@gmail.com'));

-- Weekly events policies
CREATE POLICY "Admin read weekly_events"
  ON public.weekly_events
  FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('admin@showtix.com', 'admin@example.com', 'ritikpaswal79984@gmail.com'));

CREATE POLICY "Admin insert weekly_events"
  ON public.weekly_events
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' IN ('admin@showtix.com', 'admin@example.com', 'ritikpaswal79984@gmail.com'));

CREATE POLICY "Admin update weekly_events"
  ON public.weekly_events
  FOR UPDATE
  USING (auth.jwt() ->> 'email' IN ('admin@showtix.com', 'admin@example.com', 'ritikpaswal79984@gmail.com'));

CREATE POLICY "Admin delete weekly_events"
  ON public.weekly_events
  FOR DELETE
  USING (auth.jwt() ->> 'email' IN ('admin@showtix.com', 'admin@example.com', 'ritikpaswal79984@gmail.com'));

-- Public access policies (for public viewing of special offers and weekly events)
CREATE POLICY "Public read active special_offers"
  ON public.special_offers
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read weekly_events"
  ON public.weekly_events
  FOR SELECT
  USING (true);

-- Make sure necessary buckets exist
DO $$
DECLARE
  bucket_exists boolean;
BEGIN
  -- Check and create marketing_assets bucket
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'marketing_assets'
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('marketing_assets', 'Marketing Assets', true);
  END IF;
END
$$;
