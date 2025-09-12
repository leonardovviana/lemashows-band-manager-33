-- Fix security warnings by setting search_path on functions

-- Update the existing functions to have proper search_path
ALTER FUNCTION public.get_user_role(UUID) SET search_path = public;
ALTER FUNCTION public.get_user_band(UUID) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.create_dev_user(text, text) SET search_path = public;