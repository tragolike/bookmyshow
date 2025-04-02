
-- Add payment_instructions field to payment_settings if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_settings' 
    AND column_name = 'payment_instructions'
  ) THEN
    ALTER TABLE public.payment_settings ADD COLUMN payment_instructions TEXT;
  END IF;
END $$;

-- Add created_at column to ticket_types if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticket_types' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.ticket_types ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
END $$;
