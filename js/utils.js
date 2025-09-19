// Utility functions for the application

// Show toast notification
function showToast(title, description, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  toast.innerHTML = `
    <div class="toast-title">${title}</div>
    <div class="toast-description">${description}</div>
  `;
  
  container.appendChild(toast);
  
  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  // Hide and remove toast after 5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, 5000);
}

// Format date for display
function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Format time for display
function formatTime(time) {
  if (!time) return '';
  return time.substring(0, 5);
}

// Format currency
function formatCurrency(value) {
  if (!value) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Get user initials
function getUserInitials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

// Get role badge configuration
function getRoleBadge(role) {
  const badges = {
    dev: { label: 'Desenvolvedor', class: 'dev' },
    admin: { label: 'Administrador', class: 'admin' },
    usuario: { label: 'Usuário', class: 'usuario' }
  };
  return badges[role] || badges.usuario;
}

// Get status configuration
function getStatusConfig(status) {
  const configs = {
    ativo: { variant: 'success', label: 'Ativo', icon: '✓' },
    cancelado: { variant: 'error', label: 'Cancelado', icon: '✗' },
    concluido: { variant: 'secondary', label: 'Concluído', icon: '✓' },
    pendente: { variant: 'warning', label: 'Pendente', icon: '○' }
  };
  return configs[status] || configs.ativo;
}

// Validate email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize input
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Toggle password visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
  input.setAttribute('type', type);
}

// Modal utilities
function createModal(title, content, actions = []) {
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'dialog';
  
  modal.innerHTML = `
    <div class="dialog-header">
      <h2 class="dialog-title">${title}</h2>
      <button class="dialog-close" onclick="closeModal(this)">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    <div class="dialog-content">
      ${content}
    </div>
    ${actions.length > 0 ? `
      <div class="dialog-footer">
        ${actions.map(action => `<button class="btn ${action.class}" onclick="${action.onclick}">${action.label}</button>`).join('')}
      </div>
    ` : ''}
  `;
  
  overlay.appendChild(modal);
  document.getElementById('modals-container').appendChild(overlay);
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal(overlay);
    }
  });
  
  return overlay;
}

function closeModal(element) {
  const overlay = element.closest('.dialog-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      const container = document.getElementById('modals-container');
      if (container && container.contains(overlay)) {
        container.removeChild(overlay);
      }
    }, 200);
  }
}

// Loading utilities
function showLoading(message = 'Carregando...') {
  let overlay = document.getElementById('dynamic-loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'dynamic-loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-muted-foreground" id="dynamic-loading-text"></p>
      </div>`;
    document.body.appendChild(overlay);
  }
  const text = overlay.querySelector('#dynamic-loading-text');
  if (text) text.textContent = message;
  overlay.style.display = 'flex';
}

function hideLoading() {
  const overlay = document.getElementById('dynamic-loading-overlay');
  if (overlay) overlay.style.display = 'none';
}

// Generate unique ID
function generateId() {
  return 'id-' + Math.random().toString(36).substr(2, 9);
}

// Format phone number
function formatPhone(phone) {
  if (!phone) return '';
  return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
}

// Capitalize first letter
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Get current time in HH:MM format
function getCurrentTime() {
  return new Date().toTimeString().slice(0, 5);
}

// Check if user can manage shows
function canManageShows(userRole) {
  return ['dev', 'admin'].includes(userRole);
}

// Permission helpers centralizados
function canInviteUsers(currentProfile) {
  if (!currentProfile) return false;
  return currentProfile.role === 'dev' || currentProfile.role === 'admin';
}

function canEditUser(currentProfile, targetUser) {
  if (!currentProfile || !targetUser) return false;
  if (currentProfile.role === 'dev') return true;
  if (currentProfile.role === 'admin') {
    // Admin só pode editar usuarios da mesma banda e não pode editar dev/admin
    return targetUser.role === 'usuario' && targetUser.banda_id === currentProfile.banda_id;
  }
  return false;
}

function canDeleteUser(currentProfile, targetUser) {
  // Mesma regra de edição (poderíamos diferenciar se necessário)
  return canEditUser(currentProfile, targetUser);
}

// Cache simples de bandas (invalidação manual)
let _bandsCache = { data: null, ts: 0 };
async function fetchBands(force = false) {
  const now = Date.now();
  if (!force && _bandsCache.data && (now - _bandsCache.ts) < 60_000) {
    return _bandsCache.data;
  }
  try {
    const { data, error } = await window.sb.from('bands').select('id,nome').order('nome');
    if (error) throw error;
    _bandsCache = { data: data || [], ts: now };
    return _bandsCache.data;
  } catch (e) {
    console.warn('fetchBands error', e);
    return [];
  }
}
function invalidateBandsCache() { _bandsCache = { data: null, ts: 0 }; }

// Export functions for use in other files
window.utils = {
  showToast,
  formatDate,
  formatTime,
  formatCurrency,
  getUserInitials,
  getRoleBadge,
  getStatusConfig,
  isValidEmail,
  sanitizeInput,
  debounce,
  togglePassword,
  createModal,
  closeModal,
  showLoading,
  hideLoading,
  generateId,
  formatPhone,
  capitalize,
  getCurrentDate,
  getCurrentTime,
  canManageShows,
  canInviteUsers,
  canEditUser,
  canDeleteUser,
  fetchBands,
  invalidateBandsCache
};