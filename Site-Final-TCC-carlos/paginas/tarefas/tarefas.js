const apiBase = "http://localhost:3000"; // URL da API
const token = localStorage.getItem("token"); // Token salvo após login
 const theme = localStorage.getItem("modo-escuro") === "true" ? "dark" : "light";

// 🔹 Listar tarefas ao carregar a página
async function listarTarefas() {
  try {
    console.log(token);
    const res = await fetch(`${apiBase}/listar-tarefas`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .catch((error) => {
      throw new Error(`Erro ao buscar tarefas: ${JSON.stringify(error)}`);
    });

    console.log(`Tarefas: ${JSON.stringify(res)}`)

    if (!res.ok) throw new Error("Erro ao buscar tarefas.");
    const tarefas = await res.json();
    renderizarTarefas(tarefas);
  } catch (err) {
    console.error(err);
    // Substituindo alert() por SweetAlert2
    Swal.fire({
      icon: 'error',
      title: 'Erro ao Carregar',
      text: 'Não foi possível carregar as tarefas.',
      theme: theme
    });
  }
}


// 🔹 Renderizar tarefas na interface com status e progresso
function renderizarTarefas(tarefas) {
  const lista = document.querySelector(".lista-tarefas");
  lista.innerHTML = ""; // Limpar lista

  const hoje = new Date();

  tarefas.forEach((tarefa) => {
    const prazo = new Date(tarefa.data_vencimento);
    let statusClasse = tarefa.status;
    let progresso = 0;
    let background = "";

    // Calcular progresso automaticamente
    if (tarefa.status === "concluida") {
      progresso = 100;
      statusClasse = "concluido";
      background = "#10b981"
    } else if (prazo < hoje && tarefa.status !== "concluida") {
      statusClasse = "atrasado";
      progresso = 30; // Atrasado assume baixo progresso
      background = "#ef4444"
    } else if (tarefa.status === "em_andamento") {
      progresso = 70;
      statusClasse = "em-progresso";
      background = "#3b82f6"
    } else {
      progresso = 10;
      statusClasse = "pendente";
      background = "#d6a009ff"
    }

    const card = document.createElement("div");
    card.classList.add("card-tarefa");
    card.innerHTML = `
      <div class="card-header">
        <h3>${tarefa.titulo}</h3>
        <span class="status ${statusClasse}">${formatarStatus(statusClasse)}</span>
      </div>
      <div class="progresso">
        <div class="progresso-info">
          <span>Progresso</span><span>${progresso}%</span>
        </div>
        <div class="barra">
          <div class="barra-preenchida w-${progresso}" style="background-color: ${background}; width: ${progresso}%"></div>
        </div>
      </div>
      <div class="card-footer">
        <div class="data">
          <i class="ri-calendar-line"></i> ${prazo < hoje && tarefa.status !== "completed" ? "Atrasado!" : `Prazo: ${prazo.toLocaleDateString()}`}
        </div>
        <div class="acoes">
          <button onclick="editarTarefa(${tarefa.id})"><i class="ri-edit-line"></i></button>
          <button onclick="excluirTarefa(${tarefa.id})"><i class="ri-delete-bin-line"></i></button>
        </div>
      </div>
    `;
    lista.appendChild(card);
  });
}

// 🔹 Formatar texto do status
function formatarStatus(status) {
  switch (status) {
    case "pendente": return "Pendente";
    case "em-progresso": return "Em Progresso";
    case "atrasado": return "Atrasado";
    case "concluido": return "Concluído";
    default: return "Desconhecido";
  }
}

// 🔹 Criar tarefa
document.getElementById("saveTaskBtn").addEventListener("click", async () => {
  const titulo = document.getElementById("taskTitle").value;
  const prazo = document.getElementById("taskDueDate").value;
  const status = document.getElementById("taskStatus").value;
  const prioridade = document.getElementById("taskPriority").value;

  try {
    const res = await fetch(`${apiBase}/criar-tarefas`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ titulo, prazo, status, prioridade }),
    });

    if (!res.ok) throw new Error("Erro ao criar tarefa.");
    // Substituindo alert() por SweetAlert2
    Swal.fire({
      icon: 'success',
      title: 'Sucesso!',
      text: 'Tarefa criada com sucesso!',
      theme: theme
    });
    listarTarefas();
    fecharModal();
  } catch (err) {
    console.error(err);
    // Substituindo alert() por SweetAlert2
    Swal.fire({
      icon: 'error',
      title: 'Erro ao Criar',
      text: 'Não foi possível criar a tarefa.',
      theme: theme
    });
  }
});

// 🔹 Excluir tarefa
async function excluirTarefa(id) {
  // Substituindo o confirm() por SweetAlert2
  Swal.fire({
    title: 'Tem certeza?',
    text: "Esta ação não pode ser desfeita!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sim, excluir!',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await fetch(`${apiBase}/excluir-tarefas/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(`Response: ${JSON.stringify(res)}`)

        if (!res.ok) throw new Error("Erro ao excluir tarefa.");
        // Alerta de sucesso após a exclusão
        Swal.fire(
          'Excluído!',
          'A tarefa foi excluída com sucesso.',
          'success'
        );
        listarTarefas();
      } catch (err) {
        console.error(err);
        // Alerta de erro após a exclusão
        Swal.fire({
          icon: 'error',
          title: 'Erro ao Excluir',
          text: 'Não foi possível excluir a tarefa.'
        });
      }
    }
  });
}

// 🔹 Editar tarefa (pré-carrega no modal)
async function editarTarefa(id) {
  const res = await fetch(`${apiBase}/listar-tarefas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const tarefas = await res.json();
  const tarefa = tarefas.find(t => t.id === id);

  document.getElementById("taskTitle").value = tarefa.titulo;
  document.getElementById("taskDueDate").value = tarefa.data_vencimento.split("T")[0];
  document.getElementById("taskPriority").value = tarefa.complexidade;
  document.getElementById("taskStatus").value = tarefa.status;

  abrirModal();

  document.getElementById("saveTaskBtn").onclick = async () => {
    await atualizarTarefa(id);
  };
}

// 🔹 Atualizar tarefa
async function atualizarTarefa(id) {
  const titulo = document.getElementById("taskTitle").value;
  const prazo = document.getElementById("taskDueDate").value;
  const status = document.getElementById("taskStatus").value;
  const prioridade = document.getElementById("taskPriority").value;

  try {
    const res = await fetch(`${apiBase}/atualizar-tarefas/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ titulo, prazo, status, prioridade }),
    });

    if (!res.ok) throw new Error("Erro ao atualizar tarefa.");
    // Substituindo alert() por SweetAlert2
    Swal.fire({
      icon: 'success',
      title: 'Sucesso!',
      text: 'Tarefa atualizada com sucesso!',
theme: theme
    });
    listarTarefas();
    fecharModal();
  } catch (err) {
    console.error(err);
    // Substituindo alert() por SweetAlert2
    Swal.fire({
      icon: 'error',
      title: 'Erro ao Atualizar',
      text: 'Não foi possível atualizar a tarefa.',
      theme: theme
    });
  }
}

// 🔹 Modal de nova tarefa
const modal = document.getElementById("newTaskModal");
document.getElementById("newTaskBtn").onclick = abrirModal;
document.getElementById("cancelTaskBtn").onclick = fecharModal;

function abrirModal() { modal.style.display = "block"; }
function fecharModal() { modal.style.display = "none"; }

// 🔹 Carregar as tarefas ao iniciar
window.onload = listarTarefas;

// Seletores do chat
const aiInput = document.getElementById('aiInput');
const aiSendBtn = document.getElementById('aiSendBtn');
const aiChat = document.getElementById('aiChat');

// Função para adicionar mensagens ao chat
function adicionarMensagem(remetente, texto) {
    const msgDiv = document.createElement('div');
    
    if (remetente === 'assistente') {
        msgDiv.classList.add('mensagem-ia');
        msgDiv.innerHTML = `
            <div class="ia-avatar"><i class="ri-robot-line"></i></div>
            <div class="ia-msg"><p>${texto}</p></div>
        `;
    } else {
        msgDiv.classList.add('mensagem-usuario');
        msgDiv.innerHTML = `
            <div class="usuario-msg"><p>${texto}</p></div>
        `;
    }

    aiChat.appendChild(msgDiv);
    aiChat.scrollTop = aiChat.scrollHeight;
    return msgDiv;
}

// Função para processar mensagens e gerar resposta automática
function processarMensagem() {
    const texto = aiInput.value.trim();
    if (texto !== '') {
        adicionarMensagem('usuario', texto); // Mensagem do usuário
        aiInput.value = '';

        // Exibe "digitando..." do assistente
        const digitandoMsg = adicionarMensagem('assistente', 'Digitando...');

        setTimeout(() => {
            // Lista de respostas automáticas variadas
            const respostas = [
                `Interessante! Você mencionou: "${texto}". Quer me contar mais?`,
                `Legal! "${texto}" parece um bom assunto.`,
                `Você disse: "${texto}". O que mais posso saber sobre isso?`,
                `Hmm... "${texto}", gostei do que falou! Continue.`,
                `Entendi, "${texto}". Pode me explicar melhor?`,
                `Boa! "${texto}" é algo importante?`
            ];

            // Escolhe uma resposta aleatória
            const resposta = respostas[Math.floor(Math.random() * respostas.length)];

            // Substitui "digitando..." pela resposta escolhida
            digitandoMsg.querySelector('.ia-msg p').innerText = resposta;
        }, 1500); // tempo do efeito "digitando"
    }
}

// Evento de clique no botão
aiSendBtn.addEventListener('click', processarMensagem);

// Evento de Enter no input
aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        processarMensagem();
    }
});