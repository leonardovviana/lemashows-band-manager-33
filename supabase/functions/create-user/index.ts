// Referência do runtime edge Supabase
// deno-lint-ignore-file no-explicit-any
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

// Declaração mínima para editores que não conhecem Deno
declare const Deno: any;

// Função Edge para criar usuário usando Service Role (executa no backend)
// Configure a env var SUPABASE_SERVICE_ROLE_KEY no dashboard (Project Settings -> Functions -> secrets)

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }
  try {
    // Verifica token do solicitante
    const auth = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Token ausente' }), { status: 401 });
    }

    const accessToken = auth.replace(/Bearer\s+/i, '');
    // Variáveis de ambiente / fallbacks
    const projectUrl = Deno.env.get('SUPABASE_URL') || 'https://mvfawaucnnczhyjuupcg.supabase.co';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceKey || !projectUrl) {
      return new Response(JSON.stringify({ error: 'Configuração de backend ausente' }), { status: 500 });
    }

    // Validar sessão do solicitante
    const userRes = await fetch(`${projectUrl}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${accessToken}`, 'apikey': serviceKey }
    });
    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401 });
    }
    const requester = await userRes.json();

    const { nome, email, role, password } = await req.json();
    if (!nome || !email || !role || !password) {
      return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400 });
    }

    // Somente roles permitidos
    const allowedRoles = ['usuario', 'admin', 'dev'];
    if (!allowedRoles.includes(role)) {
      return new Response(JSON.stringify({ error: 'Role inválido' }), { status: 400 });
    }

    // Obter role real do solicitante via tabela profiles
    let requesterRole = 'usuario';
    try {
      const profRes = await fetch(`${projectUrl}/rest/v1/profiles?select=role&id=eq.${requester.id}`, {
        headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey }
      });
      if (profRes.ok) {
        const arr = await profRes.json();
        if (Array.isArray(arr) && arr[0]?.role) requesterRole = arr[0].role;
      }
    } catch (_) {}

    if (!['dev','admin'].includes(requesterRole)) {
      return new Response(JSON.stringify({ error: 'Sem permissão para criar usuários' }), { status: 403 });
    }

    let finalRole = role;
    if (requesterRole === 'admin') {
      finalRole = 'usuario'; // força
    }

    const res = await fetch(`${projectUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify({
        email,
        password,
        user_metadata: { nome },
        app_metadata: { role: finalRole }
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      return new Response(JSON.stringify({ error: 'Falha Supabase: ' + txt }), { status: 400 });
    }

    const created = await res.json();

    // Opcional: inserir/atualizar role / nome na tabela profiles (caso trigger não trate)
    // Tentativa silenciosa
    try {
      await fetch(`${projectUrl}/rest/v1/profiles`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ id: created.user.id, nome, role: finalRole })
      });
    } catch (_) {}

    return new Response(JSON.stringify({ user: created.user }), { status: 201 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Erro interno' }), { status: 500 });
  }
});
