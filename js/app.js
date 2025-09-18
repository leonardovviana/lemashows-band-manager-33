// Main application logic for app.html

let currentUser = null;
let currentProfile = null;
let currentPage = 'dashboard';

// Este arquivo agora expõe initializeApp para ser chamado pelo main unificado
// Não inicializa automaticamente ao carregar o script.

async function initializeApp() {
  try {
    utils.showLoading();
    
    // Check authentication
    const { data: { user } } = await window.sb.auth.getUser();
    if (!user) {
      // Sem sessão: mostrar view de autenticação (função global definida em main.js)
      utils.hideLoading();
      if (typeof showAuthView === 'function') {
        showAuthView();
      }
      return;
    }
    
    currentUser = user;
    
    // Fetch user profile
    await fetchUserProfile();
    
    // Setup auth listener
  window.sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = 'index.html';
      }
    });
    
    // Initialize UI
    setupSidebar();
    setupNavigation();
    updateUserInfo();
    
    // Load initial page
    await loadPage('dashboard');
    
  // Show app e esconder root de login se existir
  const appContainer = document.getElementById('app-container');
  if (appContainer) appContainer.classList.remove('hidden');
  const root = document.getElementById('root');
  if (root) root.innerHTML = '';
    utils.hideLoading();
    
  } catch (error) {
    console.error('App initialization error:', error);
    utils.showToast('Erro', 'Erro ao carregar aplicação', 'error');
    utils.hideLoading();
    if (typeof showAuthView === 'function') {
      showAuthView();
    }
  } finally {
    // overlay dinâmico já tratado por hideLoading
  }
}

async function fetchUserProfile() {
  try {
    const { data, error } = await window.sb
      .from('profiles')
      .select('*, bands ( nome )')
      .eq('id', currentUser.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
    }
    if (!data) {
      // Fallback: tentar criar perfil básico caso trigger não tenha rodado ainda
      try {
        const email = currentUser.email;
        const nome = (currentUser.user_metadata && currentUser.user_metadata.nome) || 'Usuário';
        const insertRes = await window.sb.from('profiles').insert({ id: currentUser.id, email, nome }).select('*').maybeSingle();
        if (insertRes.error) {
          console.warn('Falha ao criar perfil fallback:', insertRes.error.message);
        } else {
          currentProfile = insertRes.data;
        }
      } catch (e) {
        console.warn('Exceção criando perfil fallback', e);
      }
    } else {
      currentProfile = data;
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
}

function setupSidebar() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const sidebar = document.getElementById('sidebar');
  const mobileOverlay = document.getElementById('mobile-overlay');
  
  mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    mobileOverlay.classList.toggle('hidden');
  });
  
  mobileOverlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    mobileOverlay.classList.add('hidden');
  });
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.getAttribute('data-page');
      loadPage(page);
      
      // Update active state
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Close mobile sidebar
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('mobile-overlay').classList.add('hidden');
    });
  });
  
  // Logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
  const { error } = await window.sb.auth.signOut();
      if (error) {
        utils.showToast('Erro ao sair', error.message, 'error');
      } else {
        utils.showToast('Logout realizado com sucesso', 'Você foi desconectado do sistema.', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      utils.showToast('Erro', 'Erro ao fazer logout', 'error');
    }
  });
}

function updateUserInfo() {
  if (!currentProfile) return;
  
  const userInitials = document.getElementById('user-initials');
  const userName = document.getElementById('user-name');
  const userRole = document.getElementById('user-role');
  const userBand = document.getElementById('user-band');
  
  userInitials.textContent = utils.getUserInitials(currentProfile.nome);
  userName.textContent = currentProfile.nome || 'Usuário';
  
  const roleBadge = utils.getRoleBadge(currentProfile.role);
  userRole.textContent = roleBadge.label;
  userRole.className = `user-role ${roleBadge.class}`;

  if (userBand) {
    if (currentProfile.role === 'usuario' || currentProfile.role === 'admin') {
      const bandName = currentProfile.bands?.nome || 'Sem banda';
      userBand.textContent = bandName;
      userBand.style.display = 'block';
    } else {
      userBand.style.display = 'none';
    }
  }
  
  // Show/hide users nav for admins and devs
  const usersNav = document.getElementById('users-nav');
  if (utils.canManageShows(currentProfile.role)) {
    usersNav.classList.remove('hidden');
  } else {
    usersNav.classList.add('hidden');
  }
}

async function loadPage(page) {
  const pageContent = document.getElementById('page-content');
  currentPage = page;
  
  try {
    switch (page) {
      case 'dashboard':
        pageContent.innerHTML = await window.Dashboard.render(currentProfile);
        window.Dashboard.init(currentProfile);
        break;
      case 'calendar':
        pageContent.innerHTML = await window.Calendar.render(currentProfile);
        window.Calendar.init(currentProfile);
        break;
      case 'users':
        if (utils.canManageShows(currentProfile?.role)) {
          pageContent.innerHTML = await window.Users.render(currentProfile);
          window.Users.init(currentProfile);
        } else {
          utils.showToast('Acesso negado', 'Você não tem permissão para acessar esta página', 'error');
          // Redirecionar silenciosamente para dashboard
          setTimeout(() => loadPage('dashboard'), 800);
        }
        break;
      case 'reports':
        pageContent.innerHTML = await window.Reports.render(currentProfile);
        window.Reports.init(currentProfile);
        break;
      default:
        pageContent.innerHTML = '<div class="text-center p-8"><h2>Página não encontrada</h2></div>';
    }
  } catch (error) {
    console.error('Error loading page:', error);
    pageContent.innerHTML = '<div class="text-center p-8"><h2>Erro ao carregar página</h2></div>';
  }
}

// Export for global access
window.app = {
  getCurrentUser: () => currentUser,
  getCurrentProfile: () => currentProfile,
  loadPage,
  fetchUserProfile
};