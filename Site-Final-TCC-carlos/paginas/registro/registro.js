// A primeira parte do seu código, substituindo os alerts
document.querySelector('form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nomeCompleto = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const senha = document.getElementById('reg-password').value;
    const departamento = document.getElementById('reg-department').value;

    const departamentos = {
        ti: 1,
        rh: 2,
        financeiro: 3,
        marketing: 4
    };

    const departamentoId = departamentos[departamento];
    const theme = localStorage.getItem("modo-escuro") === "true" ? "dark" : "light";

    if (!departamentoId) {
        // Substituindo o alert() por SweetAlert2
        Swal.fire({
            icon: 'warning',
            title: 'Atenção!',
            text: 'Por favor, selecione um departamento válido.',
            theme: theme
        });
        return;
    }

    const aceitouTermos = document.getElementById('terms').checked;
    if (!aceitouTermos) {
        // Substituindo o alert() por SweetAlert2
        Swal.fire({
            icon: 'warning',
            title: 'Atenção!',
            text: 'Você precisa aceitar os Termos de Serviço para continuar.',
            theme: theme
        });
        return;
    }

    try {
        const resposta = await fetch('http://localhost:3000/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome_completo: nomeCompleto,
                email: email,
                senha_hash: senha,
                departamento_id: departamentoId
            })
        });

        const resultado = await resposta.json();
        
        if (resposta.ok) {
            // Substituindo o alert() de sucesso
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Usuário registrado com sucesso!',
                theme: theme
            }).then(() => {
                // O redirecionamento só acontece depois que o usuário fecha o alerta
                window.location.href = "/paginas/login/login.html";
            });

        } else {
            // Substituindo o alert() de erro
            Swal.fire({
                icon: 'error',
                title: 'Erro no Registro',
                text: `Ocorreu um erro: ${resultado.message}`,
                theme: theme
            });
        }

    } catch (erro) {
        console.error('Erro:', erro);
        // Substituindo o alert() de erro
        Swal.fire({
            icon: 'error',
            title: 'Erro de Conexão',
            text: 'Não foi possível se conectar com o servidor para o registro.',
            theme: theme
        });
    }
});

// O restante do seu código permanece igual, pois ele não usa alerts
// Lógica para carregar departamentos
fetch('/departamentos')
    .then(response => response.json())
    .then(departamentos => {
        const select = document.getElementById('reg-department');
        departamentos.forEach(departamento => {
            const option = document.createElement('option');
            option.value = departamento.id;
            option.textContent = departamento.nome;
            select.appendChild(option);
        });
    })
    .catch(error => console.error('Erro ao carregar departamentos:', error));

// Fetch duplicado removido para evitar redundância
// fetch('/departamentos')
// ... (código removido)

// Lógica para a força da senha
document.addEventListener("DOMContentLoaded", () => {
    const passwordInput = document.getElementById("reg-password");
    const bars = document.querySelectorAll(".password-strength .bar");
    const tip = document.querySelector(".password-tip");

    function updateStrengthBar(strength) {
        bars.forEach((bar, index) => {
            bar.style.opacity = index <= strength ? "1" : "0.2";
        });
        const messages = [
            "Senha muito fraca - use pelo menos 6 caracteres",
            "Senha fraca - adicione números ou letras maiúsculas",
            "Senha média - adicione caracteres especiais",
            "Senha forte - excelente!"
        ];
        tip.textContent = messages[strength];
    }

    function checkPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return Math.min(strength, 3);
    }

    if (passwordInput) {
        passwordInput.addEventListener("input", () => {
            const password = passwordInput.value;
            const strength = checkPasswordStrength(password);
            updateStrengthBar(strength);
        });
    }
});

// Alternar visibilidade da senha
document.addEventListener("DOMContentLoaded", () => {
    const passwordInput = document.getElementById("reg-password");
    const toggleButton = document.querySelector(".input-button-icon i");

    document.querySelector(".input-button-icon").addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        toggleButton.classList.toggle("ri-eye-line");
        toggleButton.classList.toggle("ri-eye-off-line");
    });
});