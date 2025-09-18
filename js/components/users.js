// Users component
window.Users = {
  users: [],
  filteredUsers: [],
  showDev: false,

  async render(userProfile) {
    // Fallback de acesso negado (caso chegue aqui incorretamente)
    if (userProfile?.role === 'usuario') {
      return `
        <div class="card p-8 text-center">
          <h2 class="text-xl font-semibold mb-2">Acesso negado</h2>
          <p class="text-muted-foreground">Você não tem permissão para visualizar o gerenciamento de usuários.</p>
        </div>
      `;
    }
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">Gerenciamento de Usuários</h1>
          <p class="page-description">Controle de usuários e permissões</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline" onclick="Users.exportUsers()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Exportar
          </button>
          ${utils.canInviteUsers(userProfile) ? `
            <button class="btn btn-primary" onclick="Users.openInviteDialog()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Convidar Usuário
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Users Stats -->
      <div class="stats-grid">
        <div class="stats-card">
          <div class="stats-card-header">
            <h3 class="stats-card-title">Total Usuários</h3>
            <svg class="stats-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
            </svg>
          </div>
          <p id="total-users" class="stats-card-value">0</p>
        </div>

        <div class="stats-card">
          <div class="stats-card-header">
            <h3 class="stats-card-title">Administradores</h3>
            <svg class="stats-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <p id="admin-users" class="stats-card-value">0</p>
        </div>

        <div class="stats-card">
          <div class="stats-card-header">
            <h3 class="stats-card-title">Usuários Ativos</h3>
            <svg class="stats-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p id="active-users" class="stats-card-value">0</p>
        </div>

        <div class="stats-card">
          <div class="stats-card-header">
            <h3 class="stats-card-title">Cadastros Hoje</h3>
            <svg class="stats-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
          <p id="today-signups" class="stats-card-value">0</p>
        </div>
      </div>

      <!-- Users List -->
      <div class="card">
        <div class="card-header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 class="card-title">Lista de Usuários</h2>
            <div class="flex items-center gap-2">
              <input type="text" id="users-search" class="input" placeholder="Buscar usuários..." style="width: 250px;" oninput="Users.filterUsers(this.value)">
              <select id="role-filter" class="select" onchange="Users.filterByRole(this.value)">
                <option value="">Todos os perfis</option>
                <option value="dev">Desenvolvedor</option>
                <option value="admin">Administrador</option>
                <option value="usuario">Usuário</option>
              </select>
              ${userProfile?.role === 'dev' ? `<button id="toggle-dev-btn" class="btn btn-outline" onclick="Users.toggleDevVisibility()">Mostrar Devs</button>` : ''}
            </div>
          </div>
        </div>
        <div class="card-content">
          <div id="users-list" class="users-list">
            <!-- Users will be loaded here -->
          </div>
        </div>
      </div>
    `;
  },

  async init(userProfile) {
    this.userProfile = userProfile;
    await this.loadUsers();
    this.updateStats();
  },

  async loadUsers() {
    try {
      let query = supabase
        .from('profiles')
        .select(`*, bands (nome) `)
        .order('created_at', { ascending: false });

      if (this.userProfile?.role === 'admin') {
        if (this.userProfile.banda_id) {
          query = query.eq('banda_id', this.userProfile.banda_id);
        } else {
          this.users = [];
          this.filteredUsers = [];
          return;
        }
      }
      // dev vê tudo
      const { data: users, error } = await query;
      if (error) throw error;
      this.users = users || [];
      this.applyBaseFilter();
      this.renderUsersList();
    } catch (error) {
      console.error('Error loading users:', error);
      utils.showToast('Erro', 'Erro ao carregar usuários', 'error');
    }
  },

  applyBaseFilter() {
    this.filteredUsers = this.showDev ? this.users : this.users.filter(u => u.role !== 'dev');
  },

  updateStats() {
    const list = this.filteredUsers;
    const totalUsers = list.length;
    const adminUsers = list.filter(u => u.role === 'admin').length; // dev não conta nas stats
    const activeUsers = list.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
    const todaySignups = list.filter(u => {
      const today = new Date().toDateString();
      return new Date(u.created_at).toDateString() === today;
    }).length;
    if (document.getElementById('total-users')) document.getElementById('total-users').textContent = totalUsers;
    if (document.getElementById('admin-users')) document.getElementById('admin-users').textContent = adminUsers;
    if (document.getElementById('active-users')) document.getElementById('active-users').textContent = activeUsers;
    if (document.getElementById('today-signups')) document.getElementById('today-signups').textContent = todaySignups;
  },
  toggleDevVisibility() {
    this.showDev = !this.showDev;
    this.applyBaseFilter();
    this.renderUsersList();
    this.updateStats();
    const btn = document.getElementById('toggle-dev-btn');
    if (btn) btn.textContent = this.showDev ? 'Ocultar Devs' : 'Mostrar Devs';
  },

  renderUsersList() {
    const container = document.getElementById('users-list');
    if (!container) return;

    if (this.filteredUsers.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: hsl(var(--muted-foreground));">
          <p>Nenhum usuário encontrado</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.filteredUsers.map(user => this.renderUserCard(user)).join('');
  },

  renderUserCard(user) {
  const roleBadge = utils.getRoleBadge(user.role);
  const initials = utils.getUserInitials(user.nome);
  const canManage = utils.canEditUser(this.userProfile, user);

    return `
      <div class="user-card">
        <div class="user-card-avatar">
          <div class="user-avatar">
            <span class="user-initials">${initials}</span>
          </div>
        </div>
        <div class="user-card-info">
          <div class="user-card-main">
            <h3 class="user-card-name">${utils.sanitizeInput(user.nome)}</h3>
            <p class="user-card-email">${utils.sanitizeInput(user.email)}</p>
          </div>
          <div class="user-card-details">
            <span class="badge badge-${roleBadge.variant}">${roleBadge.label}</span>
            ${user.bands ? `
              <span class="user-band">${utils.sanitizeInput(user.bands.nome)}</span>
            ` : ''}
            <span class="user-date">Cadastro: ${utils.formatDate(user.created_at)}</span>
          </div>
        </div>
        <div class="user-card-actions">
          ${canManage ? `
            <button class="action-btn" onclick="Users.editUser('${user.id}')" title="Editar">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            ${user.role !== 'dev' ? `
              <button class="action-btn destructive" onclick="Users.deleteUser('${user.id}')" title="Excluir">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            ` : ''}
          ` : ''}
        </div>
      </div>
    `;
  },

  filterUsers(searchTerm) {
    const filteredUsers = this.filteredUsers.filter(user => 
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const container = document.getElementById('users-list');
    container.innerHTML = filteredUsers.map(user => this.renderUserCard(user)).join('');
  },

  filterByRole(role) {
    const base = this.filteredUsers;
    const filteredUsers = role ? base.filter(user => user.role === role) : base;
    const container = document.getElementById('users-list');
    container.innerHTML = filteredUsers.map(user => this.renderUserCard(user)).join('');
  },

  openInviteDialog() {
    if (!utils.canInviteUsers(this.userProfile)) {
      utils.showToast('Acesso negado', 'Você não tem permissão para convidar usuários', 'error');
      return;
    }
    const modal = utils.createModal(
      'Convidar Usuário',
      `
        <form id="invite-user-form" class="form-grid space-y-4">
          <div class="form-group">
            <label class="form-label">Nome</label>
            <input type="text" id="invite-nome" class="input" placeholder="Nome do usuário" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="invite-email" class="input" placeholder="email@exemplo.com" required>
          </div>
          <div class="form-group">
            <label class="form-label">Perfil</label>
            <select id="invite-role" class="select" required>
              <option value="">Selecione o perfil</option>
              <option value="usuario">Usuário</option>
              ${this.userProfile?.role === 'dev' ? '<option value="admin">Administrador</option>' : ''}
              ${this.userProfile?.role === 'dev' ? '<option value="dev">Desenvolvedor</option>' : ''}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Senha Temporária</label>
            <input type="password" id="invite-password" class="input" placeholder="Senha temporária" required>
          </div>
        </form>
      `,
      [
        { label: 'Cancelar', class: 'btn-outline', onclick: 'utils.closeModal(this)' },
        { label: 'Enviar Convite', class: 'btn-primary', onclick: 'Users.inviteUser()' }
      ]
    );
  },

  async inviteUser() {
    const nome = document.getElementById('invite-nome').value;
    const email = document.getElementById('invite-email').value;
  let role = document.getElementById('invite-role').value;
    const password = document.getElementById('invite-password').value;
    
    if (!nome || !email || !role || !password) {
      utils.showToast('Erro', 'Por favor, preencha todos os campos', 'error');
      return;
    }
    
    try {
      // Chamada para função edge (precisa existir em /functions/create-user)
      const session = await window.sb.auth.getSession();
      const accessToken = session?.data?.session?.access_token;
      if (!accessToken) throw new Error('Sessão inválida');
      // Admin não pode criar outra coisa além de usuario
      if (this.userProfile?.role === 'admin') {
        role = 'usuario';
      }
      const resp = await fetch('/functions/v1/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ nome, email, role, password })
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || 'Falha ao criar usuário');
      }
      utils.showToast('Sucesso', 'Usuário criado com sucesso', 'success');
      utils.closeModal(document.getElementById('invite-user-form'));
      await this.loadUsers();
      this.updateStats();
    } catch (error) {
      console.error('Error inviting user:', error);
      utils.showToast('Erro', error.message || 'Erro ao enviar convite', 'error');
    }
  },

  async editUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const modal = utils.createModal(
      'Editar Usuário',
      `
        <form id="edit-user-form" class="form-grid space-y-4">
          <div class="form-group">
            <label class="form-label">Nome</label>
            <input type="text" id="edit-nome" class="input" value="${user.nome}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="edit-email" class="input" value="${user.email}" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Perfil</label>
            <select id="edit-role" class="select" required>
              <option value="usuario" ${user.role === 'usuario' ? 'selected' : ''}>Usuário</option>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
              ${this.userProfile?.role === 'dev' ? `<option value="dev" ${user.role === 'dev' ? 'selected' : ''}>Desenvolvedor</option>` : ''}
            </select>
          </div>
        </form>
      `,
      [
        { label: 'Cancelar', class: 'btn-outline', onclick: 'utils.closeModal(this)' },
        { label: 'Salvar', class: 'btn-primary', onclick: `Users.updateUser('${userId}')` }
      ]
    );
  },

  async updateUser(userId) {
    const nome = document.getElementById('edit-nome').value;
    const role = document.getElementById('edit-role').value;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nome, role })
        .eq('id', userId);
      
      if (error) throw error;
      
      utils.showToast('Sucesso', 'Usuário atualizado com sucesso', 'success');
      utils.closeModal(document.getElementById('edit-user-form'));
      await this.loadUsers();
      this.updateStats();
      
    } catch (error) {
      console.error('Error updating user:', error);
      utils.showToast('Erro', 'Erro ao atualizar usuário', 'error');
    }
  },

  async deleteUser(userId) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      utils.showToast('Sucesso', 'Usuário excluído com sucesso', 'success');
      await this.loadUsers();
      this.updateStats();
      
    } catch (error) {
      console.error('Error deleting user:', error);
      utils.showToast('Erro', 'Erro ao excluir usuário', 'error');
    }
  },

  exportUsers() {
    utils.showToast('Info', 'Funcionalidade de exportação em desenvolvimento', 'info');
  }
};