-- Update functions with proper search_path without dropping them

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS public.user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.get_user_band(user_uuid UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT banda_id FROM public.profiles WHERE id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, nome, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data ->> 'nome', 'Usuário'),
        new.email,
        COALESCE((new.raw_user_meta_data ->> 'role')::public.user_role, 'usuario')
    );
    RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_dev_user(
  user_email text,
  user_name text DEFAULT 'Admin Sistema'
)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  banda_id_var uuid;
BEGIN
  -- Get or create admin band
  SELECT id INTO banda_id_var FROM public.bands WHERE nome = 'Administração Sistema' LIMIT 1;
  
  IF banda_id_var IS NULL THEN
    INSERT INTO public.bands (nome) VALUES ('Administração Sistema') RETURNING id INTO banda_id_var;
  END IF;
  
END;
$$;