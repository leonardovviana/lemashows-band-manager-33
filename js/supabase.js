// Supabase client configuration
const SUPABASE_URL = "https://mvfawaucnnczhyjuupcg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12ZmF3YXVjbm5jemh5anV1cGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MDk4MTgsImV4cCI6MjA3MzI4NTgxOH0.jz6NgNXCMMoOo_tRAuKE3lJqZKC0ewHF7N6erWKRCo4";

// Create Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});