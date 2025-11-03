    // Payments component: área dedicada a faturas/pagamentos
    (function(){
    const state = {
        userProfile: null,
        invoices: [],
        loading: false,
            bands: [],
            loadingBands: false,
    };

    function statusBadge(status){
        const s = String(status || 'pendente').toLowerCase();
        if (s === 'pago') return '<span class="badge badge-usuario">Pago</span>';
        if (s === 'cancelado') return '<span class="badge badge-dev">Cancelado</span>';
        return '<span class="badge badge-admin">Pendente</span>';
    }

    async function loadInvoices(){
        const prof = state.userProfile;
        if (!prof?.banda_id) { state.invoices = []; return; }
        state.loading = true;
        try {
        state.invoices = await window.utils.fetchBandInvoices(prof.banda_id, 6);
        } catch (e) {
        console.warn('[payments] falha ao carregar faturas', e);
        state.invoices = [];
        } finally {
        state.loading = false;
        }
    }

        async function loadBandsForDev(){
            if (state.userProfile?.role !== 'dev') return;
            state.loadingBands = true;
            try {
                const { data, error } = await window.sb.from('bands').select('id, nome').order('nome');
                if (error) throw error;
                state.bands = data || [];
            } catch (e) {
                console.warn('[payments] falha ao carregar bandas', e);
                state.bands = [];
            } finally {
                state.loadingBands = false;
            }
        }

        async function renderBandsBillingSummary(){
            const host = document.getElementById('payments-bands-summary');
            if (!host || state.userProfile?.role !== 'dev') return;
            if (state.loadingBands) {
                host.innerHTML = '<div class="p-6 text-center text-muted-foreground">Carregando bandas...</div>';
                return;
            }
            if (!state.bands.length){
                host.innerHTML = '<div class="p-6 text-center text-muted-foreground">Nenhuma banda encontrada</div>';
                return;
            }
            try {
                const summaries = await Promise.all(state.bands.map(async b => {
                    const invoices = await utils.fetchBandInvoices(b.id, 3);
                    const summary = invoices.map(inv => {
                        const s = String(inv.status).toLowerCase() === 'pago' ? 'Pago' : 'Pendente';
                        return `${inv.month} ${inv.year}: ${s}`;
                    }).join(' • ');
                    return `<li><strong>${utils.sanitizeInput(b.nome)}:</strong> ${summary || 'Sem faturas'}</li>`;
                }));
                host.innerHTML = `
                    <ul class="list" style="gap:.25rem;">
                        ${summaries.map(s => `<li class="list-item" style="padding:.5rem 0; border:none; background:transparent;">${s}</li>`).join('')}
                    </ul>`;
            } catch (e) {
                host.innerHTML = '<div class="p-6 text-center text-muted-foreground">Falha ao montar resumo</div>';
            }
        }

    function renderList(){
        const host = document.getElementById('payments-list');
        if (!host) return;
        if (state.loading) {
        host.innerHTML = '<div class="p-6 text-center text-muted-foreground">Carregando faturas...</div>';
        return;
        }
        if (!state.invoices.length){
        host.innerHTML = '<div class="p-6 text-center text-muted-foreground">Nenhuma fatura encontrada</div>';
        return;
        }
        host.innerHTML = `
        <ul class="list">
            ${state.invoices.map(inv => `
            <li class="list-item">
                <div class="list-item-content">
                <p class="list-item-title">${inv.month} ${inv.year}</p>
                <div class="list-item-meta">
                    <span>Venc.: ${utils.formatDate(inv.due_date)}</span>
                    ${inv.amount != null ? `<span>Valor: ${utils.formatCurrency(inv.amount)}</span>` : ''}
                </div>
                </div>
                <div class="list-item-actions">${statusBadge(inv.status)}</div>
            </li>
            `).join('')}
        </ul>`;
    }

    function openConfigureBilling(){
        utils.createModal('Configurar Pagamentos', `
        <div class="space-y-4">
            <p class="text-muted-foreground">Tela de configuração em desenvolvimento.</p>
            <p class="text-muted-foreground">Aqui você poderá definir dados de cobrança, dia de vencimento e consultar histórico.</p>
        </div>
        `, [
        { label: 'Fechar', class: 'btn-outline', onclick: 'utils.closeModal(this)' }
        ]);
    }

    window.Payments = {
        async render(userProfile){
        if (!utils.canManageShows(userProfile?.role)) {
            return `
            <div class="card p-8 text-center">
                <h2 class="text-xl font-semibold mb-2">Acesso negado</h2>
                <p class="text-muted-foreground">Você não tem permissão para acessar Pagamentos.</p>
            </div>`;
        }
        return `
            <div class="page-header">
            <div>
                <h1 class="page-title">Pagamentos</h1>
                <p class="page-description">Acompanhe e gerencie as faturas da sua banda</p>
            </div>
            <div class="page-header-actions">
                <button class="btn btn-outline" onclick="Payments.openConfigureBilling()">Configurar</button>
            </div>
            </div>
            <div class="card">
            <div class="card-header"><h2 class="card-title">Faturas Recentes</h2></div>
            <div class="card-content" id="payments-list"></div>
                    </div>
                    ${userProfile?.role === 'dev' ? `
                    <div class="card" style="margin-top:1rem;">
                        <div class="card-header"><h2 class="card-title">Faturas por Banda (últimos meses)</h2></div>
                        <div class="card-content" id="payments-bands-summary"></div>
                    </div>` : ''}
                    `;
        },
        async init(userProfile){
        state.userProfile = userProfile;
                await Promise.all([loadInvoices(), loadBandsForDev()]);
                renderList();
                await renderBandsBillingSummary();
        },
        openConfigureBilling
    };
    })();
