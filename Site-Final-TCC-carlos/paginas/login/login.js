import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBL1AtsLZjLzsWcILFv9207QHir_n9OnlU",
    authDomain: "talky-cs.firebaseapp.com",
    projectId: "talky-cs",
    storageBucket: "talky-cs.firebasestorage.app",
    messagingSenderId: "123937502019",
    appId: "1:123937502019:web:f0912d9303b5a823ed75f6",
    measurementId: "G-4BXNE8E12J"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const forgotLink = document.getElementById('forgot-password-link');
const modal = document.getElementById('modal-reset');
const closeModal = document.getElementById('close-modal');
const formReset = document.getElementById('form-reset-password');
const theme = localStorage.getItem("modo-escuro") === "true" ? "dark" : "light";

forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

formReset.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('reset-email').value.trim();
    const novaSenha = document.getElementById('new-password').value.trim();

    if (!email || !novaSenha) {
        // Substituindo o alert() por SweetAlert2
        Swal.fire({
            icon: 'warning',
            title: 'Atenção!',
            text: 'Por favor, preencha todos os campos.',
            theme: theme
        });
        return;
    }

    try {
        if (resposta.ok) {
            // Salva o token retornado pela API
            localStorage.setItem('token', resultado.token);

            // Salva também o authToken para a barra mudar para Logout
            localStorage.setItem('authToken', resultado.token);

            signInWithPopup(auth, provider)
                .then((result) => {
                    // Salva estado de login no navegador
                    localStorage.setItem("usuarioLogado", "true");

                    // Redireciona para a página inicial
                    window.location.href = "/paginas/inicio/inicio.html";
                })

                .catch((error) => {
                    console.error("Erro no login:", error);
                });


            if (resposta.ok) {
                // Substituindo o alert() de sucesso
                Swal.fire({
                    icon: 'success',
                    title: 'Sucesso!',
                    text: 'Sua senha foi redefinida com sucesso!',
                    theme: theme
                });
                modal.classList.add('hidden');
            } else {
                // Substituindo o alert() de erro
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: `Erro: ${resultado.message}`,
                    theme: theme
                });
            }
        }
    } catch (erro) {
        console.error("Erro:", erro);
        // Substituindo o alert() de erro
        Swal.fire({
            icon: 'error',
            title: 'Erro de Conexão',
            text: 'Não foi possível se conectar ao servidor para redefinir a senha.',
            theme: theme
        });
    }

});

// Lógica de Login
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('password').value.trim();

        if (!email || !senha) {
            // Substituindo o alert() por SweetAlert2
            Swal.fire({
                icon: 'warning',
                title: 'Atenção!',
                text: 'Preencha todos os campos para fazer login.',
                theme: theme
            });
            return;
        }

        try {
            const resposta = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    senha_hash: senha
                })
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                localStorage.setItem('token', resultado.token);
                // Substituindo o alert() de sucesso
                Swal.fire({
                    icon: 'success',
                    title: 'Login Realizado',
                    text: 'Você será redirecionado para a página inicial.',
                    theme: theme
                }).then(() => {
                    window.location.href = "/paginas/inicio/inicio.html";
                });
            } else {
                // Substituindo o alert() de erro
                Swal.fire({
                    icon: 'error',
                    title: 'Falha no Login',
                    text: `Erro: ${resultado.message}`,
                    theme: theme
                });
            }
        } catch (erro) {
            console.error('Erro ao conectar com o servidor:', erro);
            // Substituindo o alert() de erro
            Swal.fire({
                icon: 'error',
                title: 'Erro de Conexão',
                text: 'Não foi possível se conectar com o servidor.',
                theme: theme
            });
        }
    });

    // Função de login com Google
    window.loginComGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                // Substituindo o alert() de sucesso
                Swal.fire({
                    icon: 'success',
                    title: 'Bem-vindo(a)!',
                    text: `Bem-vindo(a), ${user.displayName}.`,
                    theme: theme
                }).then(() => {
                    window.location.href = "/paginas/inicio/inicio.html";
                });
            })
            .catch((error) => {
                console.error("Erro ao fazer login:", error);
                // Substituindo o alert() de erro
                Swal.fire({
                    icon: 'error',
                    title: 'Falha no Login com Google',
                    text: 'Ocorreu um erro ao tentar fazer login com sua conta do Google. Por favor, tente novamente.',
                    theme: theme
                });
            });
    };

    // Lógica para o botão de alternar visibilidade da senha
    const passwordField = document.getElementById('password');
    const togglePasswordButton = document.querySelector('.input-button-icon');

    if (togglePasswordButton && passwordField) {
        togglePasswordButton.addEventListener('click', () => {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            const icon = togglePasswordButton.querySelector('i');
            icon.classList.toggle('ri-eye-off-line', type === 'password');
            icon.classList.toggle('ri-eye-line', type === 'text');
        });
    }
});

localStorage.setItem("usuarioLogado", "true");

const sairBtn = document.getElementById('btn-sair-modal');

sairBtn?.addEventListener('click', () => {
    modal.classList.add('hidden');
});

document.addEventListener("DOMContentLoaded", function () {
    // Exemplo: verifica se há token de login salvo
    let usuarioLogado = localStorage.getItem("usuarioLogado");

    if (usuarioLogado) {
        let btnEntrar = document.getElementById("btnEntrar");
        let btnRegistrar = document.getElementById("btnRegistrar");

        if (btnEntrar) {
            btnEntrar.textContent = "Logout";
            btnEntrar.href = "#";
            btnEntrar.addEventListener("click", function () {
                localStorage.removeItem("usuarioLogado");
                window.location.reload();
            });
        }

        if (btnRegistrar) {
            btnRegistrar.style.display = "none"; // Esconde "Registrar"
        }
    }
});