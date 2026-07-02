// const nodemailer = require('nodemailer');
document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const answer = button.nextElementSibling;

    // Toggle visibilidade da resposta
    if (answer.classList.contains('hidden')) {
      answer.classList.remove('hidden');
      button.querySelector('.icon-faq').style.transform = 'rotate(180deg)';
    } else {
      answer.classList.add('hidden');
      button.querySelector('.icon-faq').style.transform = 'rotate(0deg)';
    }
  });
});

 document.addEventListener("DOMContentLoaded", () => {
    const estiloEscuro = document.getElementById("style-escuro");
    const isDark = localStorage.getItem("modo-escuro") === "true";
    if (estiloEscuro) estiloEscuro.disabled = !isDark;

    document.getElementById("btn_form").addEventListener("click", () => {
      sendMail();
    })
  });

async function sendMail() {
  let email = document.getElementById("email").value;
  let assunto = document.getElementById("subject").value;
  let mensagem = document.getElementById("message").value;

  const result = await fetch(`http://localhost:3000/send-mail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({email: email, assunto: assunto, mensagem: mensagem})
  });
  // .then(response => {
  //   response.json()
  //   console.log(JSON.stringify('Resposta: ' + JSON.stringify(response.json)));
  // })
  // .then(data =>  {
  //   // console.log(data)
  //   console.log('Data: ' + data);
  // })
  // .catch(error => console.error(`Error: ${JSON.stringify(error)}`));
  if(!result.ok) {
    console.log(JSON.stringify(result))
    return;
  };

  console.log(`Enviou: ${JSON.stringify(result)}`)
  alert(JSON.stringify(result.json()))
  

  console.log(JSON.stringify(result));
  return;
}
  
// async function sendMail() {

//   let transporter = await nodemailer.createTransport({
//     host: 'smtp.gmail.com', 
//     port: 587,
//     secure: false, 
//     auth: {
//       user: 'TalkyCs.Corporativo@gmail.com',
//       pass: 'tsdwd bsxo mydj bbcv'
//     }
//   });
//   console.log("entrou");
//   let email = document.getElementById("email").value;
//   let assunto = document.getElementById("subject").value;
//   let mensagem = document.getElementById("message").value;

//   let info = await transporter.sendMail({
//     from: email,
//     to: 'TalkyCs.Corporativo@gmail.com',
//     subject: assunto,
//     text: mensagem

//   })
// };

  //  console.log("mensagem enviada: %s",info.massageId);

  // enviarEmail().catch(console.error);