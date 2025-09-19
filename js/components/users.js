// Users component (limpo e estável)
(function(){
  const state = {
    userProfile: null,
    users: [],
    filteredUsers: [],
    showDev: false,
  };
  function setText(id, val){ const el = document.getElementById(id); if (el) el.textContent = String(val); }

  function groupByBand(list){
    const groups = {};
    for (const u of list) {
      const key = u.bands?.nome || 'Sem banda';
      if (!groups[key]) groups[key] = [];
      groups[key].push(u);
    }
    return groups;
  }

  function sanitize(s){ return utils.sanitizeInput(s); }

  function getRoleBadge(role){ return utils.getRoleBadge(role); }

  function initials(name){ return utils.getUserInitials(name); }

  async function fetchBandsOptions(selectedId){
    try {
      const { data: bands, error } = await window.sb.from('bands').select('id, nome').order('nome');
      if (error) throw error;
      if (!bands || bands.length === 0) return '<option value="">Sem banda</option>';
      return [
        '<option value="">Sem banda</option>',
        ...bands.map(b => `<option value="${b.id}" ${selectedId === b.id ? 'selected' : ''}>${sanitize(b.nome)}</option>`)
      ].join('');
    } catch (e) {
      console.warn('Falha ao carregar bandas', e);
      return '<option value="">Sem banda</option>';
    }
  }

  function renderUserListItem(u){
    const badge = getRoleBadge(u.role);
    const canManage = utils.canEditUser(state.userProfile, u);
    return `
      <li class="list-item">
        <div class="list-item-avatar">
          <div class="avatar"><span class="avatar-initials">${initials(u.nome)}</span></div>
        </div>
        <div class="list-item-content">
          <p class="list-item-title">${sanitize(u.nome)}</p>
          <p class="list-item-subtitle">${sanitize(u.email)}</p>
          <div class="list-item-meta">
            <span class="badge badge-${u.role}">${badge.label}</span>
            ${u.bands ? `<span>${sanitize(u.bands.nome)}</span>` : ''}
            <span>Cadastro: ${utils.formatDate(u.created_at)}</span>
          </div>
        </div>
        <div class="list-item-actions">
          ${canManage ? `
            <button class="btn btn-sm" onclick="Users.editUser('${u.id}')">Editar</button>
            ${u.role !== 'dev' ? `<button class="btn btn-sm btn-outline" onclick="Users.deleteUser('${u.id}')">Excluir</button>` : ''}
          ` : ''}
        </div>
      </li>`;
  }

  function renderUsersList(){
    const container = document.getElementById('users-list');
    if (!container) return;
    if (state.filteredUsers.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: hsl(var(--muted-foreground));">
          <p>Nenhum usuário encontrado</p>
        </div>`;
      return;
    }
    const groups = groupByBand(state.filteredUsers);
    const sections = Object.keys(groups)
      .sort((a,b) => a.localeCompare(b, 'pt-BR'))
      .map(bandName => `
        <section class="band-section">
          <h3 class="band-title">${sanitize(bandName)} (${groups[bandName].length})</h3>
          <ul class="list">${groups[bandName].map(renderUserListItem).join('')}</ul>
        </section>`)
      .join('');
    container.innerHTML = sections;
  }

  async function renderBillingSection(){
    try {
      const profile = state.userProfile;
      if (!profile?.banda_id) return;
      const invoices = await window.utils.fetchBandInvoices(profile.banda_id, 3);
      const host = document.querySelector('.page-header');
      if (!host) return;
      const html = `
        <div class="card" style="margin-top:1rem;">
          <div class="card-header"><h2 class="card-title">Faturas</h2></div>
          <div class="card-content">
            <ul class="list">
              ${invoices.map(inv => `
                <li class="list-item">
                  <div class="list-item-content">
                    <p class="list-item-title">${inv.month} ${inv.year}</p>
                    <div class="list-item-meta"><span>Venc.: ${utils.formatDate(inv.due_date)}</span></div>
                  </div>
                  <div class="list-item-actions">
                    ${String(inv.status).toLowerCase() === 'pago' ? '<span class="badge badge-usuario">Pago</span>' : '<span class="badge badge-admin">Pendente</span>'}
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>`;
      host.insertAdjacentHTML('afterend', html);
    } catch (e) {
      console.warn('[billing] falha ao renderizar faturas', e);
    }
  }

  function applyBaseFilter(){
    state.filteredUsers = state.showDev ? state.users : state.users.filter(u => u.role !== 'dev');
  }

  function updateStats(){
    const list = state.filteredUsers;
    const totalUsers = list.length;
    const adminUsers = list.filter(u => u.role === 'admin').length;
    const activeUsers = list.filter(u => new Date(u.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length;
    const today = new Date().toDateString();
    const todaySignups = list.filter(u => new Date(u.created_at).toDateString() === today).length;
    setText('total-users', totalUsers);
    setText('admin-users', adminUsers);
    setText('active-users', activeUsers);
    setText('today-signups', todaySignups);
  }

  async function loadUsers(){
    try {
      const { data, error } = await window.sb
        .from('profiles')
        .select('id, nome, email, role, created_at, banda_id, bands (nome)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      state.users = data || [];
      applyBaseFilter();
      renderUsersList();
    } catch (e) {
      console.error('Error loading users:', e);
      utils.showToast('Erro', 'Erro ao carregar usuários', 'error');
    }
  }

  function toggleDevVisibility(){
    state.showDev = !state.showDev;
    applyBaseFilter();
    renderUsersList();
    updateStats();
    const btn = document.getElementById('toggle-dev-btn');
    if (btn) btn.textContent = state.showDev ? 'Ocultar Devs' : 'Mostrar Devs';
  }

  function filterUsers(term){
    const t = (term || '').toLowerCase();
    const list = state.filteredUsers.filter(u =>
      (u.nome || '').toLowerCase().includes(t) ||
      (u.email || '').toLowerCase().includes(t)
    );
    const container = document.getElementById('users-list');
    if (!container) return;
    container.innerHTML = `<ul class="list">${list.map(renderUserListItem).join('')}</ul>`;
  }

  function filterByRole(role){
    const list = role ? state.filteredUsers.filter(u => u.role === role) : state.filteredUsers;
    const container = document.getElementById('users-list');
    if (!container) return;
    container.innerHTML = `<ul class="list">${list.map(renderUserListItem).join('')}</ul>`;
  }

  function openInviteDialog(){
    if (!utils.canInviteUsers(state.userProfile)) {
      utils.showToast('Acesso negado', 'Você não tem permissão para cadastrar usuários', 'error');
      return;
    }
    utils.createModal(
      'Cadastrar Usuário',
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
              ${state.userProfile?.role === 'dev' ? '<option value="admin">Administrador</option>' : ''}
              ${state.userProfile?.role === 'dev' ? '<option value="dev">Desenvolvedor</option>' : ''}
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
        { label: 'Cadastrar', class: 'btn-primary', onclick: 'Users.inviteUser()' }
      ]
    );
  }

  async function inviteUser(){
    const nome = (document.getElementById('invite-nome')||{}).value;
    const email = (document.getElementById('invite-email')||{}).value;
    let role = (document.getElementById('invite-role')||{}).value;
    const password = (document.getElementById('invite-password')||{}).value;
    if (!nome || !email || !role || !password) {
      utils.showToast('Erro', 'Por favor, preencha todos os campos', 'error');
      return;
    }
    try {
      const { data: sessionData } = await window.sb.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error('Sessão inválida');
      if (state.userProfile?.role === 'admin') {
        role = 'usuario';
      }
      const { error: fnError } = await window.sb.functions.invoke('create-user', {
        body: { nome, email, role, password }
      });
      if (fnError) throw fnError;
      utils.showToast('Sucesso', 'Usuário criado com sucesso', 'success');
      utils.closeModal(document.getElementById('invite-user-form'));
      await loadUsers();
      updateStats();
    } catch (e) {
      console.error('Error inviting user:', e);
      utils.showToast('Erro', (e && (e.message || e.error_description)) || 'Erro ao enviar convite', 'error');
    }
  }

  async function editUser(userId){
    const user = state.users.find(u => u.id === userId);
    if (!user) return;
    let bandSelectHtml = '';
    if (state.userProfile?.role === 'dev') {
      const options = await fetchBandsOptions(user.banda_id);
      bandSelectHtml = `
        <div class="form-group">
          <label class="form-label">Banda</label>
          <select id="edit-banda" class="select">
            ${options}
          </select>
        </div>`;
    }
    utils.createModal(
      'Editar Usuário',
      `
        <form id="edit-user-form" class="form-grid space-y-4">
          <div class="form-group">
            <label class="form-label">Nome</label>
            <input type="text" id="edit-nome" class="input" value="${sanitize(user.nome)}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="edit-email" class="input" value="${sanitize(user.email)}" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Perfil</label>
            <select id="edit-role" class="select" required>
              <option value="usuario" ${user.role === 'usuario' ? 'selected' : ''}>Usuário</option>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
              ${state.userProfile?.role === 'dev' ? `<option value="dev" ${user.role === 'dev' ? 'selected' : ''}>Desenvolvedor</option>` : ''}
            </select>
          </div>
          ${bandSelectHtml}
        </form>
      `,
      [
        { label: 'Cancelar', class: 'btn-outline', onclick: 'utils.closeModal(this)' },
        { label: 'Salvar', class: 'btn-primary', onclick: `Users.updateUser('${userId}')` }
      ]
    );
  }

  async function updateUser(userId){
    const nome = (document.getElementById('edit-nome')||{}).value;
    const role = (document.getElementById('edit-role')||{}).value;
    let banda_id = null;
    if (state.userProfile?.role === 'dev') {
      const el = document.getElementById('edit-banda');
      if (el) banda_id = el.value || null;
    }
    try {
      const updateData = { nome, role };
      if (state.userProfile?.role === 'dev') updateData.banda_id = banda_id;
      const { error } = await window.sb
        .from('profiles')
        .update(updateData)
        .eq('id', userId);
      if (error) throw error;
      utils.showToast('Sucesso', 'Usuário atualizado com sucesso', 'success');
      utils.closeModal(document.getElementById('edit-user-form'));
      await loadUsers();
      updateStats();
    } catch (e) {
      console.error('Error updating user:', e);
      utils.showToast('Erro', 'Erro ao atualizar usuário', 'error');
    }
  }

  async function deleteUser(userId){
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      const { error } = await window.sb
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (error) throw error;
      utils.showToast('Sucesso', 'Usuário excluído com sucesso', 'success');
      await loadUsers();
      updateStats();
    } catch (e) {
      console.error('Error deleting user:', e);
      utils.showToast('Erro', 'Erro ao excluir usuário', 'error');
    }
  }

  function exportUsers(){
    utils.showToast('Info', 'Funcionalidade de exportação em desenvolvimento', 'info');
  }

  window.Users = {
    async render(userProfile){
      if (userProfile?.role === 'usuario') {
        return `
          <div class="card p-8 text-center">
            <h2 class="text-xl font-semibold mb-2">Acesso negado</h2>
            <p class="text-muted-foreground">Você não tem permissão para visualizar o gerenciamento de usuários.</p>
          </div>`;
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
            <div id="users-list" class="users-list"></div>
          </div>
        </div>`;
    },

    async init(userProfile){
      state.userProfile = userProfile;
      await loadUsers();
      updateStats();
      renderBillingSection();
    },

    // ações expostas
    toggleDevVisibility,
    filterUsers,
    filterByRole,
    openInviteDialog,
    inviteUser,
    editUser,
    updateUser,
    deleteUser,
    exportUsers
  };
})();