 document.addEventListener("DOMContentLoaded", () => {
    const estiloEscuro = document.getElementById("style-escuro");
    const isDark = localStorage.getItem("modo-escuro") === "true";
    if (estiloEscuro) estiloEscuro.disabled = !isDark;
  });

// Evento de login e registro
document.addEventListener('DOMContentLoaded', function() {
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

// Evento para esconder a senha quando digitar ao logar
  loginTab.addEventListener('click', function() {
    loginTab.classList.add('tab-active');
    loginTab.classList.add('text-white');
    registerTab.classList.remove('tab-active');
    registerTab.classList.add('text-gray-600');
    registerTab.classList.remove('text-white');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  
  });

// Evento para esconder a senha quando digitar ao registrar
  registerTab.addEventListener('click', function() {
    registerTab.classList.add('tab-active');
    registerTab.classList.add('text-white');
    loginTab.classList.remove('tab-active');
    loginTab.classList.add('text-gray-600');
    loginTab.classList.remove('text-white');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});
});

document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('dark-mode');
    const lightStylesheet = document.getElementById('style1');
    const darkStylesheet = document.getElementById('style-escuro');

    // Verifica se o modo escuro está ativado no armazenamento local
    if (localStorage.getItem('dark-mode') == 'enabled') {
        darkStylesheet.removeAttribute('disabled');
        lightStylesheet.setAttribute('disabled', 'true');
        darkModeToggle.checked = true; // Marca o checkbox
    }

    // Adiciona o evento de clique ao botão
    darkModeToggle.addEventListener('change', function() {
        if (darkModeToggle.checked) {
            darkStylesheet.removeAttribute('disabled');
            lightStylesheet.setAttribute('disabled', 'true');
            localStorage.setItem('dark-mode', 'enabled');
        } else {
            darkStylesheet.setAttribute('disabled', 'true');
            lightStylesheet.removeAttribute('disabled');
            localStorage.setItem('dark-mode', 'disabled');
        }
    });
});

// Evento de logar com a senha correta
document.addEventListener('DOMContentLoaded', function() {
  const passwordToggles = document.querySelectorAll('.ri-eye-line');
  
  passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const passwordField = this.parentElement.previousElementSibling; 
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        this.classList.remove('ri-eye-line');
        this.classList.add('ri-eye-off-line');
      } else {
        passwordField.type = 'password';
        this.classList.remove('ri-eye-off-line');
        this.classList.add('ri-eye-line');
      }
    });
  });
});

function changeChecked(event) {
  alert(document.getElementById('checkbox1').checked);
  if(event.checked) {
    alert('Checkbox is checked');
  } else {
    alert('Checkbox is unchecked');
  }
}

function changePercentage() {
  let checkbox1 = document.getElementById('checkbox1').checked;
  let checkbox2 = document.getElementById('checkbox2').checked;
  let checkbox3 = document.getElementById('checkbox3').checked;

  let result = 0;
  checkbox1 ? result += 33 : result += 0;
  checkbox2 ? result += 33 : result += 0;
  checkbox3 ? result += 34 : result += 0;

  console.log(result);
  document.getElementById('progress_text').innerHTML=`${result}%`;
  document.getElementById('progress_value').style.cssText = `width: ${result}%;  transition: width 1.0s ease;`
}

function handleChecked(checked) {
  alert(`New value: ${checked}`)
  checkbox.checked = checked
}

function changeChecked(event) {
  alert(document.getElementById('checkbox1').checked);
  if(event.checked) {
    alert('Checkbox is checked');
  } else {
    alert('Checkbox is unchecked');
  }
}

function changePercentage() {
  let checkbox1 = document.getElementById('checkbox1').checked;
  let checkbox2 = document.getElementById('checkbox2').checked;
  let checkbox3 = document.getElementById('checkbox3').checked;

  let result = 0;
  checkbox1 ? result += 33 : result += 0;
  checkbox2 ? result += 33 : result += 0;
  checkbox3 ? result += 34 : result += 0;

  console.log(result);
  document.getElementById('progress_text').innerHTML=`${result}%`;
  document.getElementById('progress_value').style.cssText = `width: ${result}%;  transition: width 1.0s ease;`
}

function handleChecked(checked) {
  alert(`New value: ${checked}`)
  checkbox.checked = checked
}

document.addEventListener("DOMContentLoaded", function () {
    let usuarioLogado = localStorage.getItem("usuarioLogado");

    if (usuarioLogado === "true") {
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
            btnRegistrar.style.display = "none";
        }
    }
});
