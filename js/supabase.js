// Supabase client configuration
const SUPABASE_URL = "https://mvfawaucnnczhyjuupcg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12ZmF3YXVjbm5jemh5anV1cGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MDk4MTgsImV4cCI6MjA3MzI4NTgxOH0.jz6NgNXCMMoOo_tRAuKE3lJqZKC0ewHF7N6erWKRCo4";
window.SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY;

// Detecta ambiente local para apontar Functions para o CLI (localhost)
const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const FUNCTIONS_URL = isLocalHost ? 'http://127.0.0.1:54321/functions/v1' : undefined;

// Cria cliente e exporta em window.supabase (uso direto)
const _sbLib = window.supabase; // biblioteca carregada via CDN
window.supabase = _sbLib.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  functions: FUNCTIONS_URL ? { url: FUNCTIONS_URL } : undefined,
});
// Alias curto opcional
window.sb = window.supabase;