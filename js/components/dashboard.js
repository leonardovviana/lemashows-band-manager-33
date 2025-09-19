// Dashboard component for app.html

window.Dashboard = {
  async render(userProfile) {
    return `
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-description">Visão geral do sistema</p>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stats-card">
          <div class="stats-card-header">
            <h3 class="stats-card-title">Próximos Shows</h3>
            <svg class="stats-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <p id="upcoming-shows-count" class="stats-card-value">0</p>
        </div>

        <div class="stats-card">
          <div class="stats-card-header">
            <h3 class="stats-card-title">Shows Este Mês</h3>
            <svg class="stats-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <p id="monthly-shows-count" class="stats-card-value">0</p>
        </div>

        <div class="stats-card">
          <div class="stats-card-header">
            <h3 class="stats-card-title">Faturamento</h3>
            <svg class="stats-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <p id="revenue-amount" class="stats-card-value">R$ 0,00</p>
        </div>

        <div class="stats-card">
          <div class="stats-card-header">
            <h3 class="stats-card-title">Total de Usuários</h3>
            <svg class="stats-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
            </svg>
          </div>
          <p id="users-count" class="stats-card-value">0</p>
        </div>
      </div>

      <!-- Upcoming Shows -->
      <div class="card">
        <div class="card-header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0; font-size: 1.25rem; font-weight: 600;">Próximos Shows</h2>
            ${utils.canManageShows(userProfile?.role) ? `
              <button class="btn btn-primary" onclick="Dashboard.openNewShowDialog()">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Novo Show
              </button>
            ` : ''}
          </div>
        </div>
        <div class="card-content">
          <div id="upcoming-shows-list" class="shows-list">
            <!-- Shows will be loaded here -->
          </div>
        </div>
      </div>
    `;
  },

  async init(userProfile) {
    await this.loadStats();
    await this.loadUpcomingShows(userProfile);
  },

  async loadStats() {
    try {
      // Load shows statistics
      const { data: shows, error: showsError } = await supabase
        .from('shows')
        .select('*');

      if (showsError) throw showsError;

      // Load users statistics (only if user can manage)
      let usersCount = 0;
      const currentProfile = window.app.getCurrentProfile();
      if (utils.canManageShows(currentProfile?.role)) {
        const { count, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (!usersError) {
          usersCount = count || 0;
        }
      }

      // Calculate statistics
      const now = new Date();
      const upcomingShows = shows.filter(show => new Date(show.data_show) > now);
      const monthlyShows = shows.filter(show => {
        const showDate = new Date(show.data_show);
        return showDate.getMonth() === now.getMonth() && showDate.getFullYear() === now.getFullYear();
      });
      const totalRevenue = shows.reduce((sum, show) => sum + (parseFloat(show.valor) || 0), 0);

      // Update UI
      document.getElementById('upcoming-shows-count').textContent = upcomingShows.length;
      document.getElementById('monthly-shows-count').textContent = monthlyShows.length;
      document.getElementById('revenue-amount').textContent = utils.formatCurrency(totalRevenue);
      document.getElementById('users-count').textContent = usersCount;

    } catch (error) {
      console.error('Error loading stats:', error);
      utils.showToast('Erro', 'Erro ao carregar estatísticas', 'error');
    }
  },

  async loadUpcomingShows(userProfile) {
    try {
      const { data: shows, error } = await supabase
        .from('shows')
        .select(`
          *,
          profiles!shows_criado_por_fkey (nome, role)
        `)
        .gte('data_show', new Date().toISOString())
        .order('data_show', { ascending: true })
        .limit(5);

      if (error) throw error;

      const container = document.getElementById('upcoming-shows-list');
      
      if (!shows || shows.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: hsl(var(--muted-foreground));">
            <p>Nenhum show agendado encontrado</p>
          </div>
        `;
        return;
      }

      container.innerHTML = shows.map(show => this.renderShowCard(show, userProfile)).join('');

    } catch (error) {
      console.error('Error loading upcoming shows:', error);
      utils.showToast('Erro', 'Erro ao carregar shows', 'error');
    }
  },

  renderShowCard(show, userProfile) {
    const statusConfig = utils.getStatusConfig(show.status);
    const canManage = utils.canManageShows(userProfile?.role);
    const showDate = new Date(show.data_show);
    const showTime = showDate.toTimeString().slice(0, 5);

    return `
      <div class="show-card">
        <div class="show-card-header">
          <h3 class="show-card-title">${utils.sanitizeInput(show.local)}</h3>
          <div class="show-card-actions">
            <button class="action-btn" onclick="Dashboard.viewShow('${show.id}')" title="Ver detalhes">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
            ${canManage ? `
              <button class="action-btn" onclick="Dashboard.editShow('${show.id}')" title="Editar">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button class="action-btn destructive" onclick="Dashboard.deleteShow('${show.id}')" title="Excluir">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            ` : ''}
          </div>
        </div>
        <div class="show-card-content">
          <div class="show-card-info">
            <div class="info-row">
              <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span class="info-value">${utils.formatDate(show.data_show)} às ${showTime}</span>
            </div>
            <div class="info-row">
              <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span class="info-value">${utils.sanitizeInput(show.local)}</span>
            </div>
            ${show.valor ? `
              <div class="info-row">
                <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                <span class="info-value">${utils.formatCurrency(show.valor)}</span>
              </div>
            ` : ''}
            <div class="info-row">
              <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="badge badge-${statusConfig.variant}">${statusConfig.label}</span>
            </div>
            ${show.profiles ? `
              <div class="info-row">
                <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span class="info-value">${utils.sanitizeInput(show.profiles.nome)}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  async openNewShowDialog() {
    const profile = window.app.getCurrentProfile();
    const isDev = profile?.role === 'dev';
    let bandsOptions = '';
    if (isDev) {
      const bands = await window.utils.fetchBands(true);
      bandsOptions = (bands || []).map(b => `<option value=\"${b.id}\">${utils.sanitizeInput(b.nome)}</option>`).join('');
    }
    const modal = utils.createModal(
      'Novo Show',
      `
        <form id="new-show-form" class="form-grid space-y-4">
          ${isDev ? `
          <div class="form-group">
            <label class="form-label">Banda</label>
            <select id="show-banda" class="select" required>
              <option value="">Selecione a banda</option>
              ${bandsOptions}
            </select>
          </div>` : ''}
          <div class="form-grid-cols-2">
            <div class="form-group">
              <label class="form-label">Local do Show</label>
              <input type="text" id="show-local" class="input" placeholder="Ex: Teatro Municipal" required>
            </div>
            <div class="form-group">
              <label class="form-label">Tipo de Show</label>
              <input type="text" id="show-tipo" class="input" placeholder="Ex: Acústico, Completo">
            </div>
          </div>
          
          <div class="form-grid-cols-2">
            <div class="form-group">
              <label class="form-label">Data</label>
              <input type="date" id="show-data" class="input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Horário</label>
              <input type="time" id="show-horario" class="input" required>
            </div>
          </div>
          
          <div class="form-grid-cols-2">
            <div class="form-group">
              <label class="form-label">Valor (R$)</label>
              <input type="number" id="show-valor" class="input" placeholder="0.00" step="0.01" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">Contato</label>
              <input type="text" id="show-contato" class="input" placeholder="Telefone ou email">
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Observações</label>
            <textarea id="show-observacoes" class="textarea" placeholder="Informações adicionais sobre o show"></textarea>
          </div>
        </form>
      `,
      [
        { label: 'Cancelar', class: 'btn-outline', onclick: 'utils.closeModal(this)' },
        { label: 'Criar Show', class: 'btn-primary', onclick: 'Dashboard.createShow()' }
      ]
    );
  },

  async createShow() {
    const form = document.getElementById('new-show-form');
    const formData = new FormData(form);
    
  const local = document.getElementById('show-local').value;
  const bandaSelect = document.getElementById('show-banda');
    const tipo = document.getElementById('show-tipo').value;
    const data = document.getElementById('show-data').value;
    const horario = document.getElementById('show-horario').value;
    const valor = document.getElementById('show-valor').value;
    const contato = document.getElementById('show-contato').value;
    const observacoes = document.getElementById('show-observacoes').value;
    
    if (!local || !data || !horario) {
      utils.showToast('Erro', 'Por favor, preencha os campos obrigatórios', 'error');
      return;
    }
    
    try {
      const currentUser = window.app.getCurrentUser();
      const currentProfile = window.app.getCurrentProfile();
      let bandaId = currentProfile?.banda_id || null;
      if (currentProfile?.role === 'dev') {
        bandaId = bandaSelect ? bandaSelect.value : null;
      }
      if (!bandaId) {
        utils.showToast('Erro', 'Selecione a banda para o show', 'error');
        return;
      }
      
      const dataShow = new Date(`${data}T${horario}`).toISOString();
      
      const { error } = await supabase
        .from('shows')
        .insert({
          local,
          tipo_show: tipo,
          data_show: dataShow,
          valor: valor ? parseFloat(valor) : null,
          contato,
          observacoes,
          criado_por: currentUser.id,
          banda_id: bandaId,
          status: 'ativo'
        });
      
      if (error) throw error;
      
      utils.showToast('Sucesso', 'Show criado com sucesso!', 'success');
      utils.closeModal(document.getElementById('new-show-form'));
      
      // Reload data
      await this.loadStats();
      await this.loadUpcomingShows(window.app.getCurrentProfile());
      
    } catch (error) {
      console.error('Error creating show:', error);
      utils.showToast('Erro', error?.message || 'Erro ao criar show', 'error');
    }
  },

  async viewShow(showId) {
    // Implementation for viewing show details
    utils.showToast('Info', 'Funcionalidade em desenvolvimento', 'success');
  },

  async editShow(showId) {
    // Implementation for editing show
    utils.showToast('Info', 'Funcionalidade em desenvolvimento', 'success');
  },

  async deleteShow(showId) {
    if (!confirm('Tem certeza que deseja excluir este show?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('shows')
        .delete()
        .eq('id', showId);
      
      if (error) throw error;
      
      utils.showToast('Sucesso', 'Show excluído com sucesso', 'success');
      
      // Reload data
      await this.loadStats();
      await this.loadUpcomingShows(window.app.getCurrentProfile());
      
    } catch (error) {
      console.error('Error deleting show:', error);
      utils.showToast('Erro', 'Erro ao excluir show', 'error');
    }
  }
};