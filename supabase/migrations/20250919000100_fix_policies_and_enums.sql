-- Ajustes de políticas e enum para alinhar com a UI
DO $$ BEGIN
  -- Adiciona valor 'concluido' ao enum de status de show se não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'show_status' AND e.enumlabel = 'concluido'
  ) THEN
    ALTER TYPE public.show_status ADD VALUE 'concluido';
  END IF;
END $$;

-- Garante que dev possa inserir/atualizar/excluir bandas
DROP POLICY IF EXISTS "Dev can access all bands" ON public.bands;
CREATE POLICY "Dev can access all bands"
ON public.bands FOR ALL
USING (public.get_user_role(auth.uid()) = 'dev')
WITH CHECK (public.get_user_role(auth.uid()) = 'dev');

-- Garante que dev possa inserir/atualizar/excluir shows
DROP POLICY IF EXISTS "Dev can access all shows" ON public.shows;
CREATE POLICY "Dev can access all shows"
ON public.shows FOR ALL
USING (public.get_user_role(auth.uid()) = 'dev')
WITH CHECK (public.get_user_role(auth.uid()) = 'dev');