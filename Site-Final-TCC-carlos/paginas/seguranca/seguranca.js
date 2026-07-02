 document.addEventListener("DOMContentLoaded", () => {
    const estiloEscuro = document.getElementById("style-escuro");
    const isDark = localStorage.getItem("modo-escuro") === "true";
    if (estiloEscuro) estiloEscuro.disabled = !isDark;
  });