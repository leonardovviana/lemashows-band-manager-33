// Admin component (only for dev role)
window.Admin = {
  bands: [],
  users: [],
  usersPage: 1,
  pageSize: 20,
  totalUsers: 0,
  filterSearch: '',
  filterRole: '',
  filterBand: '',
  _filtersStorageKey: 'admin-filters-v1',

  async render(profile) {
    if (profile?.role !== 'dev') {
      return `<div class="p-8 text-center"><h2>Acesso restrito</h2></div>`;
    }
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">Administração Geral</h1>
          <p class="page-description">Gerencie bandas, usuários e cargos</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="Admin.openCreateBand()">Nova Banda</button>
          <button class="btn" onclick="Admin.refresh()">Recarregar</button>
        </div>
      </div>
      <div class="grid gap-6 admin-grid">
        <div class="card">
          <div class="card-header"><h2 class="card-title">Bandas</h2></div>
          <div class="card-content" id="admin-bands-list">Carregando...</div>
        </div>
        <div class="card">
          <div class="card-header space-y-2">
            <h2 class="card-title">Usuários</h2>
            <div class="flex flex-wrap gap-2 admin-filters">
              <input id="admin-user-search" class="input input-sm" placeholder="Buscar" oninput="Admin.setSearch(this.value)" style="flex:1;min-width:120px;" />
              <select id="admin-user-role-filter" class="select select-sm" onchange="Admin.setRole(this.value)">
                <option value="">Role</option>
                <option value="usuario">Usuário</option>
                <option value="admin">Admin</option>
                <option value="dev">Dev</option>
              </select>
              <select id="admin-user-band-filter" class="select select-sm" onchange="Admin.setBand(this.value)">
                <option value="">Banda</option>
              </select>
            </div>
          </div>
          <div class="card-content" id="admin-users-list">Carregando...</div>
          <div class="card-footer flex items-center justify-between" id="admin-users-pagination"></div>
        </div>
      </div>
    `;
  },

  async init(profile) {
    if (profile?.role !== 'dev') return;
    this.restoreFilters();
    await this.loadBands();
    await this.loadUsers();
    this.renderBands();
    this.renderUsers();
    this.applyFiltersToUI();
  },

  async refresh() {
    await this.loadBands();
    await this.loadUsers();
    this.renderBands();
    this.renderUsers();
    this.applyFiltersToUI();
    utils.showToast('Atualizado', 'Dados recarregados', 'success');
  },

  async loadBands() {
    try {
      const { data, error } = await window.sb.from('bands').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      this.bands = data || [];
    } catch (e) {
      console.error(e);
      utils.showToast('Erro', 'Falha ao carregar bandas', 'error');
    }
  },

  async loadUsers() {
    try {
      let query = window.sb.from('profiles')
        .select('*, bands(nome)', { count: 'exact' })
        .order('created_at', { ascending: false });
      if (this.filterRole) query = query.eq('role', this.filterRole);
      if (this.filterBand) query = query.eq('banda_id', this.filterBand);
      if (this.filterSearch) {
        // Busca simples por nome ou email (ilike)
        query = query.ilike('nome', `%${this.filterSearch}%`);
      }
      const from = (this.usersPage - 1) * this.pageSize;
      const to = from + this.pageSize - 1;
      query = query.range(from, to);
      const { data, error, count } = await query;
      if (error) throw error;
      this.users = data || [];
      if (typeof count === 'number') this.totalUsers = count;
    } catch (e) {
      console.error(e);
      utils.showToast('Erro', 'Falha ao carregar usuários', 'error');
    }
  },

  renderBands() {
    const el = document.getElementById('admin-bands-list');
    if (!el) return;
    if (this.bands.length === 0) {
      el.innerHTML = '<p class="text-muted-foreground text-sm">Nenhuma banda</p>';
      return;
    }
    el.innerHTML = `
      <div class="flex flex-col gap-3">
        ${this.bands.map(b => `
          <div class="flex items-center justify-between border rounded p-3 band-row">
            <div class="space-y-1">
              <p class="font-medium">${utils.sanitizeInput(b.nome)}</p>
              <p class="text-xs text-muted-foreground">ID: ${b.id}</p>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-sm" onclick="Admin.editBand('${b.id}')">Editar</button>
              <button class="btn btn-sm btn-outline" onclick="Admin.manageBandUsers('${b.id}')">Usuários</button>
              <button class="btn btn-sm destructive" onclick="Admin.deleteBand('${b.id}')">Excluir</button>
            </div>
          </div>
        `).join('')}
      </div>`;
  },

  renderUsers() {
    const el = document.getElementById('admin-users-list');
    if (!el) return;
    if (this.users.length === 0) {
      el.innerHTML = '<p class="text-muted-foreground text-sm">Nenhum usuário</p>';
      return;
    }
    // Agrupar por banda (inclui 'Sem banda')
    const groups = {};
    for (const u of this.users) {
      const key = u.bands?.nome || 'Sem banda';
      if (!groups[key]) groups[key] = [];
      groups[key].push(u);
    }
    el.innerHTML = Object.keys(groups).sort((a,b) => a.localeCompare(b, 'pt-BR')).map(bandName => `
      <section class="band-section">
        <h3 class="band-title">${utils.sanitizeInput(bandName)} (${groups[bandName].length})</h3>
        <ul class="list">
          ${groups[bandName].map(u => `
            <li class="list-item">
              <div class="list-item-avatar">
                <div class="avatar"><span class="avatar-initials">${utils.getUserInitials(u.nome)}</span></div>
              </div>
              <div class="list-item-content">
                <p class="list-item-title">${utils.sanitizeInput(u.nome)} <span class="badge badge-${u.role}" style="margin-left:6px;">${u.role}</span></p>
                <p class="list-item-subtitle">${utils.sanitizeInput(u.email)}</p>
                <div class="list-item-meta">
                  ${u.bands ? `<span>${utils.sanitizeInput(u.bands.nome)}</span>` : '<span>Sem banda</span>'}
                </div>
              </div>
              <div class="list-item-actions">
                <button class="btn btn-sm" onclick="Admin.editUser('${u.id}')">Editar</button>
                <button class="btn btn-sm btn-outline" onclick="Admin.deleteUser('${u.id}')">Excluir</button>
              </div>
            </li>`).join('')}
        </ul>
      </section>`).join('');
    this.renderUsersPagination();
    this.populateBandFilter();
  },

  renderUsersPagination() {
    const pag = document.getElementById('admin-users-pagination');
    if (!pag) return;
    const totalPages = Math.max(1, Math.ceil(this.totalUsers / this.pageSize));
    const current = this.usersPage;
    pag.innerHTML = `
      <div class="text-xs text-muted-foreground">Página ${current} de ${totalPages}</div>
      <div class="flex gap-2">
        <button class="btn btn-sm" ${current===1?'disabled':''} onclick="Admin.changePage(${current-1})">‹</button>
        <button class="btn btn-sm" ${current===totalPages?'disabled':''} onclick="Admin.changePage(${current+1})">›</button>
      </div>`;
  },

  populateBandFilter() {
    const sel = document.getElementById('admin-user-band-filter');
    if (!sel) return;
    // Preserva valor atual
    const current = this.filterBand;
    const options = ['<option value="">Banda</option>']
      .concat(this.bands.map(b => `<option value="${b.id}" ${b.id===current?'selected':''}>${utils.sanitizeInput(b.nome)}</option>`));
    sel.innerHTML = options.join('');
  },

  setSearch(v) { this.filterSearch = v.trim(); this.usersPage = 1; this.saveFilters(); this.reloadUsersSilent(); },
  setRole(v) { this.filterRole = v; this.usersPage = 1; this.saveFilters(); this.reloadUsersSilent(); },
  setBand(v) { this.filterBand = v; this.usersPage = 1; this.saveFilters(); this.reloadUsersSilent(); },
  changePage(p) { if (p<1) return; const totalPages = Math.max(1, Math.ceil(this.totalUsers/this.pageSize)); if (p>totalPages) return; this.usersPage = p; this.saveFilters(); this.reloadUsersSilent(); },
  async reloadUsersSilent() { await this.loadUsers(); this.renderUsers(); },

  saveFilters() {
    try {
      const payload = {
        filterSearch: this.filterSearch,
        filterRole: this.filterRole,
        filterBand: this.filterBand,
        usersPage: this.usersPage,
        pageSize: this.pageSize
      };
      localStorage.setItem(this._filtersStorageKey, JSON.stringify(payload));
    } catch (_) { /* ignore */ }
  },

  restoreFilters() {
    try {
      const raw = localStorage.getItem(this._filtersStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed.filterSearch === 'string') this.filterSearch = parsed.filterSearch;
      if (typeof parsed.filterRole === 'string') this.filterRole = parsed.filterRole;
      if (typeof parsed.filterBand === 'string') this.filterBand = parsed.filterBand;
      if (typeof parsed.usersPage === 'number' && parsed.usersPage >= 1) this.usersPage = parsed.usersPage;
      if (typeof parsed.pageSize === 'number' && parsed.pageSize > 0) this.pageSize = parsed.pageSize;
    } catch (_) { /* ignore */ }
  },

  applyFiltersToUI() {
    const searchEl = document.getElementById('admin-user-search');
    const roleEl = document.getElementById('admin-user-role-filter');
    const bandEl = document.getElementById('admin-user-band-filter');
    if (searchEl) searchEl.value = this.filterSearch || '';
    if (roleEl) roleEl.value = this.filterRole || '';
    // bandEl options são reconstruídas em populateBandFilter() com selected baseado em this.filterBand
    if (bandEl) bandEl.value = this.filterBand || '';
  },

  openCreateBand() {
    utils.createModal('Nova Banda', `
      <form id="create-band-form" class="space-y-4">
        <div class="form-group">
          <label class="form-label">Nome</label>
          <input type="text" id="band-nome" class="input" required />
        </div>
      </form>
    `, [
      { label: 'Cancelar', class: 'btn-outline', onclick: 'utils.closeModal(this)' },
      { label: 'Criar', class: 'btn-primary', onclick: 'Admin.createBand()' }
    ]);
  },

  async createBand() {
  const nomeEl = document.getElementById('band-nome');
  const nome = nomeEl ? nomeEl.value.trim() : '';
    if (!nome) return utils.showToast('Erro', 'Informe o nome', 'error');
    try {
      const { data, error } = await window.sb.from('bands').insert({ nome }).select('id').single();
      if (error) throw error;
      utils.showToast('Sucesso', 'Banda criada', 'success');
      utils.closeModal(document.getElementById('create-band-form'));
      if (data?.id) {
        this.filterBand = data.id;
        this.saveFilters();
      }
      if (window.utils?.invalidateBandsCache) window.utils.invalidateBandsCache();
      await this.refresh();
    } catch (e) {
      console.error(e); utils.showToast('Erro', 'Falha ao criar banda', 'error');
    }
  },

  editBand(id) {
    const b = this.bands.find(x => x.id === id);
    if (!b) return;
    utils.createModal('Editar Banda', `
      <form id="edit-band-form" class="space-y-4">
        <div class="form-group">
          <label class="form-label">Nome</label>
          <input type="text" id="band-edit-nome" class="input" value="${utils.sanitizeInput(b.nome)}" required />
        </div>
      </form>
    `, [
      { label: 'Cancelar', class: 'btn-outline', onclick: 'utils.closeModal(this)' },
      { label: 'Salvar', class: 'btn-primary', onclick: `Admin.updateBand('${id}')` }
    ]);
  },

  async updateBand(id) {
  const nomeEl = document.getElementById('band-edit-nome');
  const nome = nomeEl ? nomeEl.value.trim() : '';
    if (!nome) return utils.showToast('Erro', 'Informe o nome', 'error');
    try {
      const { error } = await window.sb.from('bands').update({ nome }).eq('id', id);
      if (error) throw error;
      utils.showToast('Sucesso', 'Banda atualizada', 'success');
      utils.closeModal(document.getElementById('edit-band-form'));
      if (window.utils?.invalidateBandsCache) window.utils.invalidateBandsCache();
      await this.refresh();
    } catch (e) { console.error(e); utils.showToast('Erro', 'Falha ao atualizar banda', 'error'); }
  },

  async deleteBand(id) {
    if (!confirm('Excluir banda e desvincular usuários?')) return;
    try {
      const { error } = await window.sb.from('bands').delete().eq('id', id);
      if (error) throw error;
      utils.showToast('Sucesso', 'Banda excluída', 'success');
      if (this.filterBand === id) { this.filterBand = ''; this.saveFilters(); }
      if (window.utils?.invalidateBandsCache) window.utils.invalidateBandsCache();
      await this.refresh();
    } catch (e) { console.error(e); utils.showToast('Erro', 'Falha ao excluir banda', 'error'); }
  },

  manageBandUsers(id) {
    // Futuro: modal para vincular usuários à banda
    utils.showToast('Info', 'Gerenciamento detalhado de usuários da banda em desenvolvimento', 'info');
  },

  editUser(id) {
    const u = this.users.find(x => x.id === id);
    if (!u) return;
    // Carregar bandas p/ select
    const bandOptions = this.bands.map(b => `<option value="${b.id}" ${u.banda_id === b.id ? 'selected' : ''}>${utils.sanitizeInput(b.nome)}</option>`).join('');
    utils.createModal('Editar Usuário', `
      <form id="admin-edit-user-form" class="space-y-4">
        <div class="form-group">
          <label class="form-label">Nome</label>
          <input type="text" id="admin-user-nome" class="input" value="${utils.sanitizeInput(u.nome)}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="admin-user-email" class="input" value="${utils.sanitizeInput(u.email)}" disabled />
        </div>
        <div class="form-group">
          <label class="form-label">Perfil</label>
          <select id="admin-user-role" class="select" required>
            <option value="usuario" ${u.role==='usuario'?'selected':''}>Usuário</option>
            <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
            <option value="dev" ${u.role==='dev'?'selected':''}>Dev</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Banda</label>
          <select id="admin-user-banda" class="select">
            <option value="">Sem banda</option>
            ${bandOptions}
          </select>
        </div>
      </form>
    `, [
      { label: 'Cancelar', class: 'btn-outline', onclick: 'utils.closeModal(this)' },
      { label: 'Salvar', class: 'btn-primary', onclick: `Admin.updateUser('${id}')` }
    ]);
  },

  async updateUser(id) {
  const nomeInput = document.getElementById('admin-user-nome');
  const roleInput = document.getElementById('admin-user-role');
  const bandaInput = document.getElementById('admin-user-banda');
  const nome = nomeInput ? nomeInput.value.trim() : '';
  const role = roleInput ? roleInput.value : '';
  const banda = bandaInput ? (bandaInput.value || null) : null;
    if (!nome || !role) return utils.showToast('Erro', 'Campos obrigatórios', 'error');
    try {
      const { error } = await window.sb.from('profiles').update({ nome, role, banda_id: banda }).eq('id', id);
      if (error) throw error;
      utils.showToast('Sucesso', 'Usuário atualizado', 'success');
      utils.closeModal(document.getElementById('admin-edit-user-form'));
      await this.refresh();
    } catch (e) { console.error(e); utils.showToast('Erro', 'Falha ao atualizar usuário', 'error'); }
  },

  async deleteUser(id) {
    if (!confirm('Excluir usuário?')) return;
    try {
      const { error } = await window.sb.from('profiles').delete().eq('id', id);
      if (error) throw error;
      utils.showToast('Sucesso', 'Usuário excluído', 'success');
      await this.refresh();
    } catch (e) { console.error(e); utils.showToast('Erro', 'Falha ao excluir usuário', 'error'); }
  }
};
