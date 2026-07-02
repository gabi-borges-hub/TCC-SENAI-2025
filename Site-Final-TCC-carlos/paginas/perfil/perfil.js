// Inicialização do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, updatePassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import config from "../../config/config.js";

const firebaseConfig = {
    apiKey: "AIzaSyBL1AtsLZjLzsWcILFv9207QHir_n9OnlU",
    authDomain: "talky-cs.firebaseapp.com",
    projectId: "talky-cs",
    storageBucket: "talky-cs.firebasestorage.app",
    messagingSenderId: "123937502019",
    appId: "1:123937502019:web:f0912d9303b5a823ed75f6",
    measurementId: "G-4BXNE8E12J"
};

document.addEventListener("DOMContentLoaded", () => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const modalSenha = document.getElementById("modal-senha");
    const btnSalvarSenha = document.getElementById("btn-salvar-senha");
    const btnFecharModal = document.getElementById("btn-fechar-modal");

    // Abrir modal (pode ter mais de um botão)
    const botoesAbrirModal = document.querySelectorAll("#botao-abrir-modal, #abrir-modal-senha-final");
    botoesAbrirModal.forEach(botao => {
        botao?.addEventListener("click", () => {
            modalSenha?.classList.remove("hidden");
        });
    });

    // Fechar modal
    btnFecharModal?.addEventListener("click", () => {
        modalSenha?.classList.add("hidden");
    });

    // Salvar nova senha
    btnSalvarSenha?.addEventListener("click", async () => {
        const novaSenha = document.getElementById("nova-senha").value.trim();

        if (!novaSenha || novaSenha.length < 6) {
            alert("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }

        const user = auth.currentUser;

        if (user) {
            try {
                await updatePassword(user, novaSenha);
                alert("Senha atualizada com sucesso!");
                modalSenha?.classList.add("hidden");
            } catch (error) {
                console.error("Erro ao atualizar a senha:", error);
                alert("Erro ao alterar senha: " + error.message);
            }
        } else {
            alert("Usuário não autenticado.");
        }
    });

    const camposUsuario = [
        "full_name",
        "display_name",
        "email",
        "phone",
        "bio",
        "location",
        "language"
    ];

    const dados = Object.freeze({
        full_name: "nome_completo",
        display_name: "nome_exibicao",
        email: "email",
        phone: "telefone",
        bio: "bio",
        location: "localizacao",
        language: "idioma"
    })

    async function carregarDadosUsuario() {
        const request = await fetch(`${config.BASE_URL}/login`)

        if(!request.ok) {
            console.log(`Erro ao carregar as informações do usuário!`)
            return;
        }

        const result = await request.json();

        const parts = localStorage.getItem('token').split('.')
        const decodedPayload = atob(parts[1])
        const payloadObject = JSON.parse(decodedPayload)
        
        let user = ""
        if(result) {
            result.forEach(item => {
                if(item.email == payloadObject.email) {
                    user = item
                }
            })
        }

        if(user) {
            localStorage.setItem(`userId`, user.id)
            camposUsuario.forEach(id => {
                const campo = document.getElementById(id);
                const mappedKey = dados[id]
                if (campo) {
                    const value = user[mappedKey] ?? ""
                    campo.value = value;
                }

                if(id == "display_name") {
                    const nome_quebrado = user["nome_completo"].split(' ')
                    campo.value = nome_quebrado.length > 1 ? `${nome_quebrado[0]} ${nome_quebrado[nome_quebrado.length -1]}` : nome_quebrado[0];
                }
            });
        }
    }

    function salvarDadosUsuario() {
        const data = {};
        camposUsuario.forEach(id => {
            const campo = document.getElementById(id);
            const mappedKey = dados[id]
            if (campo) {
                data[mappedKey] = campo.value;
            }
        });
        const jsonBody = JSON.stringify(data);
        const userId = localStorage.getItem(`userId`)

        fetch(`${config.BASE_URL}/perfil/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonBody
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.json();
        })
        .then(data => {
            console.log(`Sucess: ${data}`);
            alert(`Dados atualizados com sucesso!`)
            location.reload();
        })
        .catch(error => {
            console.error(`Error: ${JSON.stringify(error)}`)
        })

        // console.log(`Dados: ${JSON.stringify(data)}`);
        // localStorage.setItem("dadosPerfil", JSON.stringify(dados));
        // alert("Alterações salvas com sucesso!");
        // const dados = {};
        // camposUsuario.forEach(id => {
        //     const campo = document.getElementById(id);
        //     if (campo) {
        //         dados[id] = campo.value;
        //     }
        // });
        // localStorage.setItem("dadosPerfil", JSON.stringify(dados));
        // alert("Alterações salvas com sucesso!");
    }

    const btnSalvar = document.querySelector(".btn-salvar");
    if (btnSalvar) {
        btnSalvar.addEventListener("click", salvarDadosUsuario);
    }

    const primeiroLogin = sessionStorage.getItem('primeiro-login');
    if (!primeiroLogin) {
        camposUsuario.forEach(id => {
            const campo = document.getElementById(id);
            if (campo && campo.tagName !== "SELECT") {
                campo.value = "";
            } else if (campo && campo.tagName === "SELECT") {
                campo.selectedIndex = 0;
            }
        });
        sessionStorage.setItem('primeiro-login', 'true');
    } else {
        carregarDadosUsuario();
    }


    // Slider de visibilidade
    const slider = document.getElementById("sliderPerfil");
    const opcoes = document.querySelectorAll("#opcoesPerfil span");

    if (slider) {
        slider.addEventListener("input", function () {
            const valor = parseInt(this.value);
            opcoes.forEach((span) => {
                span.classList.remove("ativo");
            });
            const selecionado = document.querySelector(`#opcoesPerfil span[data-index="${valor}"]`);
            if (selecionado) {
                selecionado.classList.add("ativo");
            }
        });
    }



    // Modo escuro
    const checkbox = document.getElementById("dark-mode");
    const darkModeStyle = document.getElementById("style-escuro");
    const paginaPerfil = document.getElementById("perfil");

    if (!paginaPerfil) return;

    const isDark = localStorage.getItem("modo-escuro") === "true";
    if (darkModeStyle) darkModeStyle.disabled = !isDark;

    paginaPerfil.classList.add("modo-transicao");
    checkbox.checked = isDark;

    checkbox.addEventListener("change", () => {
        const ativado = checkbox.checked;
        darkModeStyle.disabled = !ativado;
        localStorage.setItem("modo-escuro", ativado);
        paginaPerfil.classList.add("modo-transicao");
        setTimeout(() => {
            paginaPerfil.classList.remove("modo-transicao");
        }, 400);
    });

    console.log("abrirModalSenha:", window.abrirModalSenha);


    window.abrirModalSenha = function () {
        const modal = document.getElementById("modal-senha");
        if (modal) modal.classList.remove("hidden");
    };

    window.fecharModalSenha = function () {
        const modal = document.getElementById("modal-senha");
        if (modal) modal.classList.add("hidden");
    };

    window.salvarNovaSenha = async function () {
        const novaSenha = document.getElementById("nova-senha")?.value;
        if (!novaSenha || novaSenha.length < 6) {
            alert("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }

        const user = getAuth().currentUser;
        if (user) {
            try {
                await updatePassword(user, novaSenha);
                alert("Senha atualizada com sucesso!");
                fecharModalSenha();
            } catch (error) {
                console.error("Erro ao atualizar a senha:", error);
                alert("Erro ao alterar senha: " + error.message);
            }
        } else {
            alert("Usuário não autenticado.");
        }
    };


});
