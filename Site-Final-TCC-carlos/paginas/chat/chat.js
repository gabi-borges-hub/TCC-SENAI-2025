 document.addEventListener("DOMContentLoaded", () => {
    const estiloEscuro = document.getElementById("style-escuro");
    const isDark = localStorage.getItem("modo-escuro") === "true";
    if (estiloEscuro) estiloEscuro.disabled = !isDark;
  });

 // Obtém os elementos DOM necessários
const formMensagem = document.getElementById('formMensagem');
const mensagemInput = document.getElementById('mensagemInput');
const chatMessagesContainer = document.querySelector('.chat-messages');
const contactButtons = document.querySelectorAll('.contact-button');
const chatHeaderName = document.querySelector('.chat-header .user-name');
const chatHeaderProfilePic = document.querySelector('.chat-header .profile-pic img');

// Novos elementos para as funcionalidades
const emojiButton = document.querySelector('.emoji-button');
const emojiPicker = document.getElementById('emojiPicker');
const emojiItems = document.querySelectorAll('.emoji-item');
const attachmentButton = document.querySelector('.attachment-button');
const fileInput = document.getElementById('fileInput');

let activeContactName = '';

// Dados de exemplo para as conversas iniciais
const initialConversations = {
  'Carlos Eduardo': [
    { type: 'received', text: 'Olá! Precisamos revisar os indicadores de desempenho do trimestre.', timestamp: '13:40' },
    { type: 'sent', text: 'Claro, posso te mandar os arquivos atualizados.', timestamp: '13:41' },
    { type: 'received_file', name: 'indicadores_Q2.xlsx', size: '612 KB', timestamp: '13:42' },
    { type: 'received', text: 'Perfeito. Também temos uma reunião amanhã às 10h.', timestamp: '13:43' },
  ],
  'Juliana Costa': [
    { type: 'received', text: 'Obrigada por me enviar a proposta!', timestamp: 'Ontem' },
    { type: 'sent', text: 'De nada! Revisei os pontos principais e acho que está tudo pronto.', timestamp: 'Ontem' },
    { type: 'received', text: 'Ótimo. Falamos depois para agendar a apresentação.', timestamp: 'Ontem' },
  ],
  'Ricardo Almeida': [
    { type: 'received', text: 'A planilha foi enviada. Confere pra mim por favor.', timestamp: 'Ontem' },
    { type: 'sent', text: 'Chegou aqui, valeu!', timestamp: 'Ontem' },
  ]
};

// ===================================
// Funções de Utilitário
// ===================================

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function saveMessagesToLocalStorage(contactName, messages) {
  localStorage.setItem(`conversation_${contactName}`, JSON.stringify(messages));
}

function loadMessagesFromLocalStorage(contactName) {
  const messagesString = localStorage.getItem(`conversation_${contactName}`);
  return messagesString ? JSON.parse(messagesString) : null;
}

function handleFileClick(fileName) {
  alert(`O arquivo "${fileName}" seria baixado ou visualizado agora.\n\nEsta é uma simulação, pois a aplicação não tem um servidor para armazenar e disponibilizar arquivos.`);
}

/**
 * Renderiza um array de mensagens no contêiner do chat.
 * A lógica foi ajustada para evitar o erro 'undefined'.
 */
function renderMessages(messages) {
  chatMessagesContainer.innerHTML = '';
  if (!messages) {
    return;
  }

  messages.forEach(msg => {
    const newMessage = document.createElement('div');
    newMessage.classList.add('chat-message');

    // Aplica a classe de alinhamento com base no tipo de mensagem
    if (msg.type.startsWith('sent')) {
      newMessage.classList.add('sent');
    } else {
      newMessage.classList.add('received');
    }

    // Verifica se a mensagem é um arquivo ou um texto
    if (msg.name) { // Se a mensagem tiver a propriedade 'name', é um arquivo
      newMessage.classList.add('file-message');
      newMessage.innerHTML = `
        <div class="file-icon"><i class="ri-file-line"></i></div>
        <div class="file-info">
          <p class="file-name">${msg.name}</p>
          <p class="file-size">${msg.size}</p>
        </div>
      `;
      newMessage.addEventListener('click', () => handleFileClick(msg.name));
      newMessage.style.cursor = 'pointer';
    } else if (msg.text) { // Se a mensagem tiver a propriedade 'text', é um texto
      newMessage.innerHTML = `<p>${msg.text}</p>`;
    }
    
    chatMessagesContainer.appendChild(newMessage);
  });
  
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

// ===================================
// Funções Principais
// ===================================

function sendMessage(event) {
  event.preventDefault();

  const messageText = mensagemInput.value.trim();
  if (messageText && activeContactName) {
    const message = { 
      type: 'sent', 
      text: messageText, 
      timestamp: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}) 
    };

    const currentConversation = loadMessagesFromLocalStorage(activeContactName) || [];
    currentConversation.push(message);
    saveMessagesToLocalStorage(activeContactName, currentConversation);

    renderMessages(currentConversation);
    mensagemInput.value = '';
  }
}

function sendAttachment(file) {
  if (file && activeContactName) {
    const fileMessage = {
      type: 'sent_file',
      name: file.name,
      size: formatFileSize(file.size),
      timestamp: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})
    };
    
    const currentConversation = loadMessagesFromLocalStorage(activeContactName) || [];
    currentConversation.push(fileMessage);
    saveMessagesToLocalStorage(activeContactName, currentConversation);

    renderMessages(currentConversation);
  }
}

function selectContact(event) {
  const currentActive = document.querySelector('.contact-button.active');
  if (currentActive) {
    currentActive.classList.remove('active');
  }

  const clickedContact = event.currentTarget;
  clickedContact.classList.add('active');
  
  const contactName = clickedContact.querySelector('.contact-name').textContent;
  const contactPic = clickedContact.querySelector('.profile-pic img').src;
  
  activeContactName = contactName;

  chatHeaderName.textContent = contactName;
  chatHeaderProfilePic.src = contactPic;

  let messages = loadMessagesFromLocalStorage(contactName);
  
  if (!messages) {
    messages = initialConversations[contactName];
    if (messages) {
      saveMessagesToLocalStorage(contactName, messages);
    }
  }

  renderMessages(messages);
}

function toggleEmojiPicker() {
  emojiPicker.classList.toggle('hidden');
}

function insertEmoji(event) {
  const emoji = event.target.textContent;
  mensagemInput.value += emoji;
  mensagemInput.focus();
  emojiPicker.classList.add('hidden');
}

// ===================================
// Inicialização do Chat
// ===================================

formMensagem.addEventListener('submit', sendMessage);

// Anexar arquivos
attachmentButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    sendAttachment(file);
  }
  event.target.value = '';
});

// Emojis
emojiButton.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleEmojiPicker();
});

emojiItems.forEach(item => {
  item.addEventListener('click', insertEmoji);
});

document.addEventListener('click', (event) => {
  if (!emojiPicker.contains(event.target) && !emojiButton.contains(event.target)) {
    emojiPicker.classList.add('hidden');
  }
});

contactButtons.forEach(button => {
  button.addEventListener('click', selectContact);
});

document.addEventListener('DOMContentLoaded', () => {
  const firstContactButton = document.querySelector('.contact-button');
  if (firstContactButton) {
    firstContactButton.click();
  }
});

const callTone = document.getElementById("callTone");
let cameraStream = null; // Armazena o stream da câmera

// Função para abrir modal e tocar som
function abrirModal(id) {
  document.getElementById(id).classList.remove("hidden");

}

// Função para fechar modal, parar som e câmera
function fecharModal(id, stopCamera = false) {
  document.getElementById(id).classList.add("hidden");
  callTone.pause();

  if (stopCamera && cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop()); // Desliga a câmera
    cameraStream = null;
    const videoElement = document.getElementById("userCamera");
    videoElement.srcObject = null;
  }
}

// Eventos para os botões
document.querySelectorAll(".chat-header").forEach(header => {
  const phoneButton = header.querySelector(".ri-phone-line").closest("button");
  const videoButton = header.querySelector(".ri-vidicon-line").closest("button");

  // Chamada de voz
  phoneButton.addEventListener("click", () => {
    const name = header.querySelector(".user-name").innerText;
    const img = header.querySelector(".profile-pic img").src;

    document.getElementById("voiceCallName").innerText = `Chamando ${name}`;
    document.getElementById("voiceCallImage").src = img;

    abrirModal("voiceCallModal");
  });

  // Chamada de vídeo com câmera real
  videoButton.addEventListener("click", async () => {
  console.log("Botão vídeo clicado");
  const name = header.querySelector(".user-name").innerText;
  document.getElementById("videoCallName").innerText = `Chamando ${name}`;
  abrirModal("videoCallModal");

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log("Stream da câmera recebido:", cameraStream);
    const videoElement = document.getElementById("userCamera");
    videoElement.srcObject = cameraStream;
    await videoElement.play();
    console.log("Vídeo iniciado");
  } catch (err) {
    console.error("Erro ao acessar a câmera:", err);
    alert("Não foi possível acessar a câmera: " + err.message);
  }
});
})
