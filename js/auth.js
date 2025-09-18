// Authentication logic for auth.html

document.addEventListener('DOMContentLoaded', () => {
  // Check if already authenticated
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
      window.location.href = 'app.html';
    }
  });

  // Tab switching
  const tabTriggers = document.querySelectorAll('.tab-trigger');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetTab = trigger.getAttribute('data-tab');
      
      // Update active states
      tabTriggers.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      trigger.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });

  // Sign In Form
  document.getElementById('signin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const submitBtn = document.getElementById('signin-btn');
    
    if (!email || !password) {
      utils.showToast('Erro', 'Por favor, preencha todos os campos', 'error');
      return;
    }
    
    if (!utils.isValidEmail(email)) {
      utils.showToast('Erro', 'Por favor, insira um email válido', 'error');
      return;
    }
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Entrando...';
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        utils.showToast('Erro ao fazer login', error.message, 'error');
      } else {
        utils.showToast('Sucesso', 'Login realizado com sucesso!', 'success');
        setTimeout(() => {
          window.location.href = 'app.html';
        }, 1000);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      utils.showToast('Erro', 'Ocorreu um erro inesperado', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Entrar';
    }
  });

  // Sign Up Form
  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const submitBtn = document.getElementById('signup-btn');
    
    if (!name || !email || !password || !confirmPassword) {
      utils.showToast('Erro', 'Por favor, preencha todos os campos', 'error');
      return;
    }
    
    if (!utils.isValidEmail(email)) {
      utils.showToast('Erro', 'Por favor, insira um email válido', 'error');
      return;
    }
    
    if (password.length < 6) {
      utils.showToast('Erro', 'A senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      utils.showToast('Erro', 'As senhas não coincidem', 'error');
      return;
    }
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Criando conta...';
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome: name,
          }
        }
      });
      
      if (error) {
        utils.showToast('Erro ao criar conta', error.message, 'error');
      } else {
        utils.showToast('Conta criada com sucesso!', 'Verifique seu email para confirmar a conta.', 'success');
        // Switch to sign in tab
        document.querySelector('[data-tab="signin"]').click();
      }
    } catch (error) {
      console.error('Sign up error:', error);
      utils.showToast('Erro', 'Ocorreu um erro inesperado', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Criar Conta';
    }
  });
});