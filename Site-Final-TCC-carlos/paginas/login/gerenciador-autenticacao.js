// gerenciador-de-autenticacao.js

// --- Funções de Autenticação ---
function loginUser(token, userName = 'Usuário') {
  localStorage.setItem('authToken', token);
  localStorage.setItem('userName', userName);
}

function logoutUser() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userName');
  window.location.href = '/paginas/login/login.html';
}

function isUserLoggedIn() {
  return localStorage.getItem('authToken') !== null;
}

// --- Lógica de Gerenciamento da Interface e Rotas ---
document.addEventListener('DOMContentLoaded', () => {
  const botoesLoginContainer = document.getElementById('botoes-login');
  
  if (isUserLoggedIn()) {
    botoesLoginContainer.innerHTML = `
      <a id="botao-logout" href="#" class="botao-logout">Sair</a>
    `;

    const botaoLogout = document.getElementById('botao-logout');
    if (botaoLogout) {
      botaoLogout.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
      });
    }

  } else {
    botoesLoginContainer.innerHTML = `
      <a id="link-entrar" href="/paginas/login/login.html">Entrar</a>
      <a id="botao-registrar" href="/paginas/registro/registro.html">Registrar</a>
    `;
  }

  // --- Proteção de Rotas ---
  const rotaAtual = window.location.pathname;
  const rotasProtegidas = ['/paginas/chat/chat.html', '/paginas/tarefas/tarefas.html', '/paginas/perfil/perfil.html'];

  if (rotasProtegidas.includes(rotaAtual) && !isUserLoggedIn()) {
    Swal.fire({
      icon: 'warning',
      title: 'Acesso Restrito',
      text: 'Você precisa estar logado para acessar esta página.',
      confirmButtonText: 'Fazer Login'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/paginas/login/login.html';
      }
    });
  }
});