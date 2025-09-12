-- First create a band for the dev user if needed
INSERT INTO public.bands (nome) 
VALUES ('Administração Sistema') 
ON CONFLICT DO NOTHING;

-- Insert a dev user profile manually (this will be linked to the auth user)
-- Note: We'll need to update this with the actual user ID once the auth user is created
-- For now, let's create a placeholder that can be updated

-- First, let's check if we need to create a dev user in the auth system
-- We'll create a migration to set up the initial dev user data structure

-- Create a function to handle dev user creation
CREATE OR REPLACE FUNCTION public.create_dev_user(
  user_email text,
  user_name text DEFAULT 'Admin Sistema'
)
RETURNS void AS $$
DECLARE
  banda_id_var uuid;
BEGIN
  -- Get or create admin band
  SELECT id INTO banda_id_var FROM public.bands WHERE nome = 'Administração Sistema' LIMIT 1;
  
  IF banda_id_var IS NULL THEN
    INSERT INTO public.bands (nome) VALUES ('Administração Sistema') RETURNING id INTO banda_id_var;
  END IF;
  
  -- Note: This function prepares the structure but the actual user creation
  -- needs to be done through Supabase Auth interface
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;