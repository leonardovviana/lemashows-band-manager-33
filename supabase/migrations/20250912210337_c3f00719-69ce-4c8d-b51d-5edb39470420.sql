-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('dev', 'admin', 'usuario');

-- Create enum for show status
CREATE TYPE public.show_status AS ENUM ('ativo', 'cancelado');

-- Create enum for invoice status  
CREATE TYPE public.invoice_status AS ENUM ('pago', 'pendente', 'atrasado');

-- Create bands table
CREATE TABLE public.bands (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    criada_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bands ENABLE ROW LEVEL SECURITY;

-- Create profiles table (extending Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    role public.user_role NOT NULL DEFAULT 'usuario',
    banda_id UUID REFERENCES public.bands(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create shows table
CREATE TABLE public.shows (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    banda_id UUID NOT NULL REFERENCES public.bands(id) ON DELETE CASCADE,
    criado_por UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    data_show TIMESTAMP WITH TIME ZONE NOT NULL,
    local TEXT NOT NULL,
    tipo_show TEXT,
    observacoes TEXT,
    status public.show_status NOT NULL DEFAULT 'ativo',
    valor DECIMAL(10,2),
    contato TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;

-- Create invoices table
CREATE TABLE public.invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    banda_id UUID NOT NULL REFERENCES public.bands(id) ON DELETE CASCADE,
    valor DECIMAL(10,2) NOT NULL,
    status public.invoice_status NOT NULL DEFAULT 'pendente',
    data_emissao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    data_vencimento TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    acao TEXT NOT NULL,
    detalhes JSONB,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create function to get user role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS public.user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE id = user_uuid;
$$;

-- Create function to get user band
CREATE OR REPLACE FUNCTION public.get_user_band(user_uuid UUID)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT banda_id FROM public.profiles WHERE id = user_uuid;
$$;

-- RLS Policies for bands
CREATE POLICY "Dev can access all bands" 
ON public.bands FOR ALL 
USING (public.get_user_role(auth.uid()) = 'dev');

CREATE POLICY "Users can access their own band" 
ON public.bands FOR SELECT
USING (id = public.get_user_band(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Dev can access all profiles" 
ON public.profiles FOR ALL 
USING (public.get_user_role(auth.uid()) = 'dev');

CREATE POLICY "Admin can access profiles in their band" 
ON public.profiles FOR SELECT
USING (
    public.get_user_role(auth.uid()) = 'admin' AND 
    banda_id = public.get_user_band(auth.uid())
);

CREATE POLICY "Users can read their own profile" 
ON public.profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE
USING (id = auth.uid());

-- RLS Policies for shows
CREATE POLICY "Dev can access all shows" 
ON public.shows FOR ALL 
USING (public.get_user_role(auth.uid()) = 'dev');

CREATE POLICY "Band members can access their band shows" 
ON public.shows FOR SELECT
USING (banda_id = public.get_user_band(auth.uid()));

CREATE POLICY "Band members can create shows" 
ON public.shows FOR INSERT
WITH CHECK (
    banda_id = public.get_user_band(auth.uid()) AND
    criado_por = auth.uid()
);

CREATE POLICY "Admin and show creator can update shows" 
ON public.shows FOR UPDATE
USING (
    banda_id = public.get_user_band(auth.uid()) AND
    (public.get_user_role(auth.uid()) = 'admin' OR criado_por = auth.uid())
);

CREATE POLICY "Admin and show creator can delete shows" 
ON public.shows FOR DELETE
USING (
    banda_id = public.get_user_band(auth.uid()) AND
    (public.get_user_role(auth.uid()) = 'admin' OR criado_por = auth.uid())
);

-- RLS Policies for invoices
CREATE POLICY "Dev can access all invoices" 
ON public.invoices FOR ALL 
USING (public.get_user_role(auth.uid()) = 'dev');

CREATE POLICY "Admin can access band invoices" 
ON public.invoices FOR ALL
USING (
    public.get_user_role(auth.uid()) = 'admin' AND
    banda_id = public.get_user_band(auth.uid())
);

CREATE POLICY "Users can view band invoices" 
ON public.invoices FOR SELECT
USING (banda_id = public.get_user_band(auth.uid()));

-- RLS Policies for audit_logs
CREATE POLICY "Dev can access all audit logs" 
ON public.audit_logs FOR ALL 
USING (public.get_user_role(auth.uid()) = 'dev');

CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs FOR SELECT
USING (usuario_id = auth.uid());

-- Function to handle new user registration
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

-- Trigger to create profile on user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shows_updated_at
    BEFORE UPDATE ON public.shows
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();