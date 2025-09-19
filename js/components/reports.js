// Reports component
window.Reports = {
  selectedPeriod: 'month',
  
  async render(userProfile) {
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">Relatórios</h1>
          <p class="page-description">Análises e métricas do sistema</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline" onclick="Reports.filterReports()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"></path>
            </svg>
            Filtrar
          </button>
          <button class="btn btn-primary" onclick="Reports.exportReport()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right: 0.5rem;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Exportar
          </button>
        </div>
      </div>

      <!-- Period Selector -->
      <div class="card">
        <div class="card-content">
          <div class="period-selector">
            <h3 class="period-title">Período de Análise</h3>
            <div class="period-buttons">
              <button class="btn ${this.selectedPeriod === 'week' ? 'btn-primary' : 'btn-outline'}" onclick="Reports.setPeriod('week')">
                Esta Semana
              </button>
              <button class="btn ${this.selectedPeriod === 'month' ? 'btn-primary' : 'btn-outline'}" onclick="Reports.setPeriod('month')">
                Este Mês
              </button>
              <button class="btn ${this.selectedPeriod === 'quarter' ? 'btn-primary' : 'btn-outline'}" onclick="Reports.setPeriod('quarter')">
                Este Trimestre
              </button>
              <button class="btn ${this.selectedPeriod === 'year' ? 'btn-primary' : 'btn-outline'}" onclick="Reports.setPeriod('year')">
                Este Ano
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stats-card">
          <div class="stats-card-header">
            <h3 class="stats-card-title">Shows Realizados</h3>
            <svg class="stats-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p id="completed-shows" class="stats-card-value">0</p>
          <p class="stats-card-change positive">+15% vs período anterior</p>
        </div>

        <div class="stats-card">
          <div class="stats-card-header">
            <h3 class="stats-card-title">Faturamento Total</h3>
            <svg class="stats-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
          </div>
          <p id="total-revenue" class="stats-card-value">R$ 0,00</p>
          <p class="stats-card-change positive">+8% vs período anterior</p>
        </div>

        <div class="stats-card">
          <div class="stats-card-header">
            <h3 class="stats-card-title">Público Total</h3>
            <svg class="stats-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <p id="total-audience" class="stats-card-value">0</p>
          <p class="stats-card-change positive">+12% vs período anterior</p>
        </div>

        <div class="stats-card">
          <div class="stats-card-header">
            <h3 class="stats-card-title">Média por Show</h3>
            <svg class="stats-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <p id="average-per-show" class="stats-card-value">R$ 0,00</p>
          <p class="stats-card-change negative">-3% vs período anterior</p>
        </div>
      </div>

      <!-- Revenue Chart -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Evolução do Faturamento</h2>
        </div>
        <div class="card-content">
          <div id="revenue-chart" class="chart-container">
            <canvas id="revenue-canvas" width="800" height="300"></canvas>
          </div>
        </div>
      </div>

      <!-- Shows History -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Histórico de Shows</h2>
        </div>
        <div class="card-content">
          <div id="shows-history" class="shows-history">
            <!-- Shows history will be loaded here -->
          </div>
        </div>
      </div>
    `;
  },

  async init(userProfile) {
    this.userProfile = userProfile;
    await this.loadReportData();
    this.drawRevenueChart();
  },

  async loadReportData() {
    try {
      // Load shows data
      const { data: shows, error } = await supabase
        .from('shows')
        .select(`
          *,
          profiles!shows_criado_por_fkey (nome)
        `)
        .order('data_show', { ascending: false });

      if (error) throw error;

      this.shows = shows || [];
      this.calculateStats();
      this.renderShowsHistory();

    } catch (error) {
      console.error('Error loading report data:', error);
      utils.showToast('Erro', 'Erro ao carregar dados dos relatórios', 'error');
    }
  },

  calculateStats() {
    const periodShows = this.applyCurrentFilters(this.getShowsForPeriod());
    const now = new Date();
    const completedShows = periodShows.filter(show => show.status !== 'cancelado' && new Date(show.data_show) <= now);
    const totalRevenue = completedShows.reduce((sum, show) => sum + (parseFloat(show.valor) || 0), 0);
    const averagePerShow = completedShows.length > 0 ? totalRevenue / completedShows.length : 0;

    // Mock audience data since we don't have it in the database
    const totalAudience = completedShows.length * 150; // Average 150 people per show

    document.getElementById('completed-shows').textContent = completedShows.length;
    document.getElementById('total-revenue').textContent = utils.formatCurrency(totalRevenue);
    document.getElementById('total-audience').textContent = totalAudience.toLocaleString();
    document.getElementById('average-per-show').textContent = utils.formatCurrency(averagePerShow);
  },

  getShowsForPeriod() {
    const now = new Date();
    let startDate;

    switch (this.selectedPeriod) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return this.shows.filter(show => new Date(show.data_show) >= startDate);
  },

  renderShowsHistory() {
    const container = document.getElementById('shows-history');
    if (!container) return;

    const periodShows = this.applyCurrentFilters(this.getShowsForPeriod());

    if (periodShows.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: hsl(var(--muted-foreground));">
          <p>Nenhum show encontrado no período selecionado</p>
        </div>
      `;
      return;
    }

    container.innerHTML = periodShows.map(show => this.renderShowHistoryCard(show)).join('');
  },

  renderShowHistoryCard(show) {
    const statusConfig = utils.getStatusConfig(show.status);
    const showDate = new Date(show.data_show);
    
    return `
      <div class="show-history-card">
        <div class="show-history-info">
          <h3 class="show-history-title">${utils.sanitizeInput(show.local)}</h3>
          <div class="show-history-details">
            <span class="show-history-date">${utils.formatDate(show.data_show)}</span>
            <span class="show-history-location">${utils.sanitizeInput(show.local)}</span>
            ${show.valor ? `<span class="show-history-value">${utils.formatCurrency(show.valor)}</span>` : ''}
          </div>
        </div>
        <div class="show-history-status">
          <span class="badge badge-${statusConfig.variant}">${statusConfig.label}</span>
        </div>
      </div>
    `;
  },

  drawRevenueChart() {
    const canvas = document.getElementById('revenue-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Simple chart drawing - in a real app you'd use Chart.js or similar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Mock data for demonstration
    const data = [1200, 1800, 2200, 1900, 2400, 2800, 3200];
    const max = Math.max(...data);
    const padding = 40;
    
    // Draw axes
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw data points and lines
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 3;
    
    const stepX = (canvas.width - 2 * padding) / (data.length - 1);
    const stepY = (canvas.height - 2 * padding) / max;
    
    ctx.beginPath();
    data.forEach((value, index) => {
      const x = padding + index * stepX;
      const y = canvas.height - padding - value * stepY;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      // Draw point
      ctx.fillRect(x - 3, y - 3, 6, 6);
    });
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = 'hsl(var(--foreground))';
    ctx.font = '12px sans-serif';
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
    months.forEach((month, index) => {
      const x = padding + index * stepX;
      ctx.fillText(month, x - 10, canvas.height - padding + 20);
    });
  },

  setPeriod(period) {
    this.selectedPeriod = period;
    
    // Update button states
    document.querySelectorAll('.period-buttons .btn').forEach(btn => {
      btn.className = btn.onclick.toString().includes(`'${period}'`) ? 'btn btn-primary' : 'btn btn-outline';
    });
    
    this.calculateStats();
    this.renderShowsHistory();
    this.drawRevenueChart();
  },

  filterReports() {
    const modal = utils.createModal(
      'Filtrar Relatórios',
      `
        <form id="filter-form" class="form-grid space-y-4">
          <div class="form-grid-cols-2">
            <div class="form-group">
              <label class="form-label">Data Início</label>
              <input type="date" id="filter-start-date" class="input">
            </div>
            <div class="form-group">
              <label class="form-label">Data Fim</label>
              <input type="date" id="filter-end-date" class="input">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Status do Show</label>
            <select id="filter-status" class="select">
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Valor Mínimo</label>
            <input type="number" id="filter-min-value" class="input" placeholder="0.00" step="0.01" min="0">
          </div>
        </form>
      `,
      [
        { label: 'Limpar', class: 'btn-outline', onclick: 'Reports.clearFilters()' },
        { label: 'Aplicar Filtros', class: 'btn-primary', onclick: 'Reports.applyFilters()' }
      ]
    );
  },

  applyFilters() {
    const start = document.getElementById('filter-start-date').value;
    const end = document.getElementById('filter-end-date').value;
    const status = document.getElementById('filter-status').value;
    const minValue = document.getElementById('filter-min-value').value;
    this._filters = { start, end, status, minValue: minValue ? parseFloat(minValue) : null };
    this.calculateStats();
    this.renderShowsHistory();
    utils.showToast('Info', 'Filtros aplicados com sucesso', 'success');
    utils.closeModal(document.getElementById('filter-form'));
  },

  clearFilters() {
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-min-value').value = '';
    this._filters = null;
    this.calculateStats();
    this.renderShowsHistory();
  },

  exportReport() {
    const list = this.applyCurrentFilters(this.getShowsForPeriod());
    if (!list.length) return utils.showToast('Info', 'Sem dados no período selecionado', 'info');
    const headers = ['Data','Hora','Local','Tipo','Valor','Status'];
    const rows = list.map(s => {
      const d = new Date(s.data_show);
      return [
        utils.formatDate(d),
        d.toTimeString().slice(0,5),
        '"'+(s.local||'').replaceAll('"','""')+'"',
        '"'+(s.tipo_show||'').replaceAll('"','""')+'"',
        s.valor ?? '',
        s.status
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${this.selectedPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    utils.showToast('Sucesso', 'Exportação iniciada', 'success');
  }
};

// Helpers internos
window.Reports.applyCurrentFilters = function(list) {
  const f = this._filters;
  if (!f) return list;
  return list.filter(s => {
    const d = new Date(s.data_show);
    if (f.start && d < new Date(f.start)) return false;
    if (f.end) {
      const end = new Date(f.end);
      end.setHours(23,59,59,999);
      if (d > end) return false;
    }
    if (f.status && s.status !== f.status) return false;
    if (typeof f.minValue === 'number' && (parseFloat(s.valor) || 0) < f.minValue) return false;
    return true;
  });
};