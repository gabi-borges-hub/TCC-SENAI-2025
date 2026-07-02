document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.getElementById("dark-mode");
  const darkModeStyle = document.getElementById("style-escuro");

  const isDark = localStorage.getItem("modo-escuro") === "true";
  if (darkModeStyle) darkModeStyle.disabled = !isDark;

  if (checkbox) {
    checkbox.checked = isDark;

    checkbox.addEventListener("change", () => {
      const ativado = checkbox.checked;
      if (darkModeStyle) darkModeStyle.disabled = !ativado;
      localStorage.setItem("modo-escuro", ativado);
    });
  }
});
