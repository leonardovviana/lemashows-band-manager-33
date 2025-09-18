// Calendar component
window.Calendar = {
  currentDate: new Date(),
  view: 'month',
  shows: [],

  async render(userProfile) {
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">Calendário</h1>
          <p class="page-description">Visualização e gerenciamento de shows</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Exportar
          </button>
          ${utils.canManageShows(userProfile?.role) ? `
            <button class="btn btn-primary" onclick="Calendar.openNewShowDialog()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Novo Show
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Calendar Navigation -->
      <div class="card">
        <div class="card-header">
          <div class="calendar-nav">
            <div class="calendar-nav-left">
              <button class="btn btn-ghost" onclick="Calendar.navigateMonth(-1)">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h2 id="calendar-title" class="calendar-title"></h2>
              <button class="btn btn-ghost" onclick="Calendar.navigateMonth(1)">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
            <div class="calendar-nav-right">
              <div class="btn-group">
                <button class="btn ${this.view === 'month' ? 'btn-primary' : 'btn-outline'}" onclick="Calendar.setView('month')">Mês</button>
                <button class="btn ${this.view === 'week' ? 'btn-primary' : 'btn-outline'}" onclick="Calendar.setView('week')">Semana</button>
                <button class="btn ${this.view === 'day' ? 'btn-primary' : 'btn-outline'}" onclick="Calendar.setView('day')">Dia</button>
              </div>
            </div>
          </div>
        </div>
        <div class="card-content">
          <div id="calendar-grid" class="calendar-grid">
            <!-- Calendar will be rendered here -->
          </div>
        </div>
      </div>

      <!-- Shows List -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Shows Agendados</h2>
        </div>
        <div class="card-content">
          <div id="calendar-shows-list" class="shows-list">
            <!-- Shows will be loaded here -->
          </div>
        </div>
      </div>
    `;
  },

  async init(userProfile) {
    this.userProfile = userProfile;
    await this.loadShows();
    this.updateCalendarTitle();
    this.renderCalendar();
  },

  async loadShows() {
    try {
      const { data: shows, error } = await supabase
        .from('shows')
        .select(`
          *,
          profiles!shows_criado_por_fkey (nome, role)
        `)
        .order('data_show', { ascending: true });

      if (error) throw error;
      this.shows = shows || [];
      this.renderShowsList();
    } catch (error) {
      console.error('Error loading shows:', error);
      utils.showToast('Erro', 'Erro ao carregar shows', 'error');
    }
  },

  updateCalendarTitle() {
    const title = document.getElementById('calendar-title');
    if (title) {
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      title.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }
  },

  renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    if (this.view === 'month') {
      grid.innerHTML = this.renderMonthView();
    } else if (this.view === 'week') {
      grid.innerHTML = this.renderWeekView();
    } else {
      grid.innerHTML = this.renderDayView();
    }
  },

  renderMonthView() {
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    let html = `
      <div class="calendar-header">
        <div class="calendar-day-header">Dom</div>
        <div class="calendar-day-header">Seg</div>
        <div class="calendar-day-header">Ter</div>
        <div class="calendar-day-header">Qua</div>
        <div class="calendar-day-header">Qui</div>
        <div class="calendar-day-header">Sex</div>
        <div class="calendar-day-header">Sáb</div>
      </div>
    `;

    const weeks = [];
    let currentWeek = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayShows = this.getShowsForDate(currentDate);
      const isCurrentMonth = currentDate.getMonth() === this.currentDate.getMonth();
      const isToday = currentDate.toDateString() === new Date().toDateString();

      currentWeek.push(`
        <div class="calendar-day ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''}" 
             onclick="Calendar.selectDate('${currentDate.toISOString()}')">
          <div class="calendar-day-number">${currentDate.getDate()}</div>
          <div class="calendar-day-shows">
            ${dayShows.slice(0, 3).map(show => `
              <div class="calendar-show" title="${show.local}">
                <span class="show-time">${new Date(show.data_show).toTimeString().slice(0, 5)}</span>
                <span class="show-title">${show.local}</span>
              </div>
            `).join('')}
            ${dayShows.length > 3 ? `<div class="show-more">+${dayShows.length - 3} mais</div>` : ''}
          </div>
        </div>
      `);

      if (currentWeek.length === 7) {
        weeks.push(`<div class="calendar-week">${currentWeek.join('')}</div>`);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return html + weeks.join('');
  },

  renderWeekView() {
    // Simplified week view
    return '<div class="text-center p-8"><p>Visualização por semana em desenvolvimento</p></div>';
  },

  renderDayView() {
    // Simplified day view
    return '<div class="text-center p-8"><p>Visualização por dia em desenvolvimento</p></div>';
  },

  getShowsForDate(date) {
    const targetDate = date.toDateString();
    return this.shows.filter(show => 
      new Date(show.data_show).toDateString() === targetDate
    );
  },

  renderShowsList() {
    const container = document.getElementById('calendar-shows-list');
    if (!container) return;

    const currentMonth = this.currentDate.getMonth();
    const currentYear = this.currentDate.getFullYear();
    
    const monthShows = this.shows.filter(show => {
      const showDate = new Date(show.data_show);
      return showDate.getMonth() === currentMonth && showDate.getFullYear() === currentYear;
    });

    if (monthShows.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: hsl(var(--muted-foreground));">
          <p>Nenhum show agendado para este mês</p>
        </div>
      `;
      return;
    }

    container.innerHTML = monthShows.map(show => this.renderShowCard(show)).join('');
  },

  renderShowCard(show) {
    const statusConfig = utils.getStatusConfig(show.status);
    const canManage = utils.canManageShows(this.userProfile?.role);
    const showDate = new Date(show.data_show);
    const showTime = showDate.toTimeString().slice(0, 5);

    return `
      <div class="show-card">
        <div class="show-card-header">
          <h3 class="show-card-title">${utils.sanitizeInput(show.local)}</h3>
          <div class="show-card-actions">
            <button class="action-btn" onclick="Calendar.viewShow('${show.id}')" title="Ver detalhes">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
            ${canManage ? `
              <button class="action-btn" onclick="Calendar.editShow('${show.id}')" title="Editar">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button class="action-btn destructive" onclick="Calendar.deleteShow('${show.id}')" title="Excluir">
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
          </div>
        </div>
      </div>
    `;
  },

  navigateMonth(direction) {
    this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    this.updateCalendarTitle();
    this.renderCalendar();
    this.renderShowsList();
  },

  setView(view) {
    this.view = view;
    this.renderCalendar();
    // Update button states
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
      btn.className = btn.onclick.toString().includes(`'${view}'`) ? 'btn btn-primary' : 'btn btn-outline';
    });
  },

  selectDate(dateString) {
    const date = new Date(dateString);
    this.currentDate = date;
    this.updateCalendarTitle();
    this.renderCalendar();
    this.renderShowsList();
  },

  openNewShowDialog() {
    // Reuse the same dialog from Dashboard
    Dashboard.openNewShowDialog();
  },

  async viewShow(showId) {
    utils.showToast('Info', 'Funcionalidade em desenvolvimento', 'success');
  },

  async editShow(showId) {
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
      await this.loadShows();
      
    } catch (error) {
      console.error('Error deleting show:', error);
      utils.showToast('Erro', 'Erro ao excluir show', 'error');
    }
  }
};