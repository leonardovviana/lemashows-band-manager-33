// main.js - ponto de entrada unificado
// Responsável por: checar sessão, exibir tela de login ou app e realizar login (cadastro agora somente via painel admin/dev)

// Elementos dinâmicos serão montados em containers presentes no HTML unificado

async function boot() {
  try {
    console.log('[boot] iniciando');
    // Health check Supabase (com apikey)
    fetch('https://mvfawaucnnczhyjuupcg.supabase.co/auth/v1/health', {
      headers: { apikey: window.SUPABASE_PUBLISHABLE_KEY || '' }
    })
      .then(async r => {
        const txt = await r.text();
        console.log('[boot] supabase health status', r.status, txt);
      })
      .catch(e => console.warn('[boot] health fail', e));

    if (!window.sb || !window.sb.auth) {
      console.error('[boot] Supabase client não disponível');
      showAuthView();
      return;
    }

    // Tentar sessão primeiro (mais rápido que getUser em alguns casos)
    const sessionRes = await window.supabase.auth.getSession();
    const session = sessionRes?.data?.session || null;
    if (session) {
      return initializeApp();
    }

    // Sem sessão, exibir login
    showAuthView();
  } catch (e) {
    console.error('[boot] exceção', e);
    showAuthView();
  }
}

function showAuthView() {
  const root = document.getElementById('root');
  if (!root) return;
  console.log('[auth] montando tela de login');
  root.innerHTML = getAuthHTML();
  attachAuthHandlers();
  // Garantir que overlay suma
  utils.hideLoading();
  // Bloquear rolagem no login
  document.documentElement.classList.add('no-scroll');
  document.body.classList.add('no-scroll');
  // Marcar contexto de autenticação (para esconder bottom-nav)
  document.body.classList.add('auth');
  // Iniciar background animado do login
  if (window.LoginBg && typeof window.LoginBg.start === 'function') {
    window.LoginBg.start();
  }
}

// Expor globalmente para uso em app.js
window.showAuthView = showAuthView;

function getAuthHTML() {
  return `
  <div class="min-h-svh flex items-center justify-center bg-carbon p-3 auth">
    <div class="card w-full max-w-sm">
      <div class="card-header text-center space-y-4">
        <div class="mx-auto w-32 h-32 rounded-2xl overflow-hidden flex items-center justify-center bg-muted">
          <img src="img/Soldify.png" alt="Soldify" class="w-full h-full object-contain" />
        </div>
        <div>
          <p class="text-muted-foreground mt-2">Sistema de Gerenciamento de Bandas</p>
        </div>
      </div>
      <div class="card-content">
        <form id="signin-form" class="space-y-4">
          <div class="form-group">
            <label for="signin-email" class="form-label">Email</label>
            <div class="input-with-icon">
              <input type="email" id="signin-email" class="input" placeholder="seu@email.com" required />
            </div>
          </div>
          <div class="form-group">
            <label for="signin-password" class="form-label">Senha</label>
            <div class="input-with-icon">
              <input type="password" id="signin-password" class="input" placeholder="Sua senha" required />
            </div>
          </div>
          <button type="submit" class="btn btn-primary w-full" id="signin-btn">Entrar</button>
          <button type="button" id="retry-session" class="btn w-full" style="margin-top:.5rem">Recarregar Sessão</button>
          <p class="text-xs text-muted-foreground text-center mt-2">Cadastro somente via administrador da banda ou desenvolvedor.</p>
        </form>
      </div>
    </div>
  </div>`;
}

function attachAuthHandlers() {
  // Signin
  document.getElementById('signin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (document.getElementById('signin-email').value || '').trim();
    const password = document.getElementById('signin-password').value;
    const btn = document.getElementById('signin-btn');
    console.log('[login] submit', email);

    if (!email || !password) {
      return utils.showToast('Erro', 'Preencha todos os campos', 'error');
    }
    if (!utils.isValidEmail(email)) return utils.showToast('Erro', 'Email inválido', 'error');

    try {
      btn.disabled = true; btn.textContent = 'Entrando...';
      utils.hideLoading();
      const { data, error } = await window.sb.auth.signInWithPassword({ email, password });
      console.log('[login] result', { data, error });
      if (error) {
        utils.showToast('Erro', error.message || 'Falha no login', 'error');
        return;
      }
      utils.showToast('Sucesso', 'Login realizado!', 'success');
      setTimeout(async () => { await initializeApp(); }, 500);
    } catch (err) {
      console.error(err); utils.showToast('Erro', 'Falha inesperada', 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Entrar';
    }
  });

  const retryBtn = document.getElementById('retry-session');
  if (retryBtn) {
    retryBtn.addEventListener('click', async () => {
      retryBtn.disabled = true;
      retryBtn.textContent = 'Verificando...';
      try {
        const { data: { user }, error } = await window.supabase.auth.getUser();
        if (user) {
          utils.showToast('Sessão encontrada', 'Abrindo aplicação...', 'success');
          await initializeApp();
        } else {
          utils.showToast('Sem sessão', 'Faça login para continuar', 'warning');
        }
      } catch (e) {
        utils.showToast('Erro', 'Falha ao verificar sessão', 'error');
      } finally {
        retryBtn.disabled = false;
        retryBtn.textContent = 'Recarregar Sessão';
      }
    });
  }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', boot);
