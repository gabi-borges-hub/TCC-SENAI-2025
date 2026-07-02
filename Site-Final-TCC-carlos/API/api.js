const express = require('express');
const app = express();
const multer = require("multer");
const path = require("path");
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios'); // Para verificar tokens do Facebook
const db = require('./db');
const port = 3000; 
const cors = require('cors');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'sua_chave_secreta_aqui'; // guarde essa chave em .env em produção
const nodemailer = require('nodemailer');



app.use(express.json());
app.use(cors({
  origin: "*"
}));
app.use('/uploads', express.static('uploads'));

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization']; // esperado: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ erro: 'Token inválido' });
    req.usuario = user; // user terá os dados decodificados do token (ex: id, email)
    next();
  });
}


/* Inicio de sessão login e registro */
app.get('/login', (req, res) => {
    db.query('SELECT * FROM Usuarios', (error, results) => {
        if (error) {
            return res.status(500).json(res, 'Erro ao selecionar a tabela Usuarios');
        }
        res.status(200).json(results);
    });
});

app.post('/registro', async (req, res) => {
  const { nome_completo, email, senha_hash, departamento_id } = req.body;
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(senha_hash, saltRounds);

    db.query(
      'INSERT INTO Usuarios (nome_completo, email, senha_hash, departamento_id) VALUES (?, ?, ?, ?)', 
      [nome_completo, email, hashedPassword, departamento_id], 
      (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: `Erro ao inserir Usuário ${error}` });
        }
        // results.insertId é o ID do usuário criado
        res.status(201).json({ message: 'Usuário inserido com sucesso!', userId: results.insertId });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar hash da senha' });
  }
});


app.post('/login', async (req, res) => {
  const { email, senha_hash } = req.body;
  db.query('SELECT * FROM Usuarios WHERE email = ?', [email], async (error, results) => {
    if (error) {
      return res.status(500).json('Erro ao buscar usuário');
    }
    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(senha_hash, user.senha_hash);
      if (match) {
        // Gerar token JWT com os dados mínimos do usuário (ex: id e email)
        const token = jwt.sign(
          { id: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: '1h' } // duração do token (ex: 1 hora)
        );
        return res.status(200).json({ message: 'Login bem-sucedido!', token });
      } else {
        return res.status(401).json('Credenciais inválidas');
      }
    } else {
      return res.status(404).json('Usuário não encontrado');
    }
  });
});


app.put('/login/:id', async (req, res) => {
    const { nome_completo, email, senha_hash } = req.body; 
    const { id } = req.params;
    try {
        const hashedPassword = await bcrypt.hash(senha_hash, 10);
        db.query('UPDATE Usuarios SET nome_completo = ?, email = ?, senha_hash = ? WHERE id = ?', 
            [nome_completo, email, hashedPassword, id], 
            (error) => {
            if (error) {
                return res.status(500).json('Erro ao atualizar o Usuário');
            }
            res.status(200).json('Usuário atualizado com sucesso!');
        });
    } catch (error) {
        res.status(500).json('Erro ao criar hash da nova senha');
    }
});

app.delete('/login/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Usuarios WHERE id = ?', [id], (error) => {
         if (error) {
            return res.status(500).json({'Erro ao deletar algo na tabela Usuarios' :error});
        }
        res.status(200).json({message: 'Usuario deletado com sucesso!'});
    });
});

app.post('/alterar-senha', autenticarToken, async (req, res) => {
    const { novaSenha } = req.body;
    const idUsuario = req.usuario.id;

    if (!novaSenha || novaSenha.length < 6) {
        return res.status(400).send("Senha inválida.");
    }

    try {
        const senhaHash = await bcrypt.hash(novaSenha, 10);
        await db.query("UPDATE Usuarios SET senha_hash = ? WHERE id = ?", [senhaHash, idUsuario]);
        res.send("Senha atualizada com sucesso.");
    } catch (erro) {
        console.error(erro);
        res.status(500).send("Erro ao atualizar senha.");
    }
});

app.post('/resetar-senha', async (req, res) => {
  const { email, novaSenha } = req.body;

  // Verificar se o email e a nova senha foram fornecidos
  if (!email || !novaSenha) {
    return res.status(400).json({ message: "Email e nova senha são obrigatórios." });
  }

  // Verificar se a nova senha tem pelo menos 6 caracteres
  if (novaSenha.length < 6) {
    return res.status(400).json({ message: "A nova senha deve ter pelo menos 6 caracteres." });
  }

  try {
    // Verificar se o usuário existe com o email fornecido
    db.query('SELECT * FROM Usuarios WHERE email = ?', [email], async (error, results) => {
      if (error) {
        console.error('Erro ao buscar usuário:', error);
        return res.status(500).json({ message: 'Erro no servidor.' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      // Gerar o hash da nova senha
      const senhaHash = await bcrypt.hash(novaSenha, 10);

      // Atualizar a senha no banco
      db.query('UPDATE Usuarios SET senha_hash = ? WHERE email = ?', [senhaHash, email], (errUpdate) => {
        if (errUpdate) {
          console.error('Erro ao atualizar senha:', errUpdate);
          return res.status(500).json({ message: 'Erro ao atualizar senha.' });
        }

        return res.status(200).json({ message: 'Senha atualizada com sucesso!' });
      });
    });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro interno ao redefinir a senha.' });
  }
});

/* fim da sessão de login e registro */

/* inicio da sessão de departamentos */

app.get('/Departamentos', (req, res) => {
    db.query('SELECT * FROM Departamentos', (error, results) => {
        if (error) {
            return res.status(500).json(res, 'Erro ao selecionar a tabela Departamentos');
        }
        res.status(200).json(results);
    });
});

app.post('/Departamentos', (req, res) => {
    const {nome} = req.body;
    db.query('INSERT INTO Departamentos (nome) VALUES ( ?)', 
        [nome], 
        (error, results) => {
        if (error) {
            return res.status(500).json({message: `Erro ao inserir Departamento: ${error}`});
        }
        res.status(201).json({message:'Departamento inserido com sucesso!'});
    });
});

/* Fim da sessão de departamentos */

/* Inicio da sessão de continue com */

const GOOGLE_CLIENT_ID = 'SEU_CLIENT_ID_DO_GOOGLE'; // Seu Client ID do Google
const FACEBOOK_APP_ID = 'SEU_APP_ID_DO_FACEBOOK'; // Seu App ID do Facebook
const FACEBOOK_APP_SECRET = 'SEU_APP_SECRET_DO_FACEBOOK'; // Seu App Secret do Facebook
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
app.post('/social-login', async (req, res) => {
    const { token, provider } = req.body;
    try {
        let email = '';
        let name = '';
        let providerId = ''; // ID único do usuário no provedor social
        if (provider === 'google') {
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
             providerId = payload.sub; // 'sub' é o ID único do usuário Google
        } else if (provider === 'facebook') {
            // Verificar o token de acesso do Facebook
            const debugTokenResponse = await axios.get(
                `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`
            );
            if (!debugTokenResponse.data.data.is_valid) {
                return res.status(401).json({ message: 'Token do Facebook inválido.' });
            }
            const userInfoResponse = await axios.get(
                `https://graph.facebook.com/me?fields=id,name,email&access_token=${token}`
                 );
            email = userInfoResponse.data.email;
            name = userInfoResponse.data.name;
            providerId = userInfoResponse.data.id; // ID único do usuário Facebook
        } else {
            return res.status(400).json({ message: 'Provedor social não suportado.' });
        }
        // 1. Verificar se o usuário já existe no seu banco de dados
        let user = await User.findOne({ email: email });
        if (user) {
            // Se o usuário existe, você pode querer vincular a conta social se ainda não estiver vinculada
            // Ou simplesmente logar o usuário
            // Ex: user.googleId = providerId; await user.save();
            return res.status(200).json({ message: 'Login social bem-sucedido!', user });
        } else {
            // 2. Se o usuário não existe, crie uma nova conta
            // Você pode gerar uma senha aleatória ou marcar como conta social
            const newUser = new User({
                name: name,
                email: email,
                // Para contas sociais, você pode não precisar de uma senha tradicional
                // Ou gerar uma aleatória e forçar o usuário a definir uma depois
                 password: 'SOCIAL_LOGIN_PASSWORD', // Placeholder, idealmente não armazene assim
                // Adicione campos específicos do provedor se necessário
                [`${provider}Id`]: providerId, // Ex: googleId, facebookId
                // departamento: 'Default' ou pedir para o usuário selecionar
            });
            await newUser.save();
            return res.status(201).json({ message: 'Conta social criada e login bem-sucedido!', user: newUser });
        }
    } catch (error) {
        console.error('Erro no login social:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao processar login social.' });
    }
});

 /* Fim da sessão de continue com */

// Inicio API do Chat

// Configuração do multer para salvar arquivos em /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/"); // Certifique-se de criar essa pasta
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Rota POST para enviar mensagem com anexos
app.post("/mensagens/upload", upload.array("arquivos", 5), async (req, res) => {
  const { remetente_id, destinatario_id, conteudo } = req.body;
  const arquivos = req.files;

  if (!remetente_id || !conteudo) {
    return res.status(400).json({ erro: "remetente_id e conteudo são obrigatórios" });
  }

  if (conteudo.length > 1000) {
    return res.status(400).json({ erro: "Mensagem muito longa, limite de 1000 caracteres" });
  }

  try {
    // Inserir mensagem
    const resultadoInsercao = await db.execute(
      `INSERT INTO Mensagens (remetente_id, destinatario_id, conteudo) VALUES (?, ?, ?)`,
      [remetente_id, destinatario_id || null, conteudo]
    );

    const mensagem_id = resultadoInsercao[0]?.insertId;

    if (!mensagem_id) {
      throw new Error("Não foi possível obter o ID da nova mensagem.");
    }

    // Inserir arquivos (se houver)
    if (Array.isArray(arquivos) && arquivos.length > 0) {
      const sql = `
        INSERT INTO Arquivos_Mensagens 
        (mensagem_id, nome_arquivo, caminho_arquivo, tipo_arquivo, tamanho)
        VALUES ?
      `;

      const valores = arquivos.map(file => [
        mensagem_id,
        file.originalname,
        file.path,
        file.mimetype,
        file.size
      ]);

      await db.query(sql, [valores]); // Se estiver usando `mysql2/promise`, `query` funciona aqui
    }

    res.json({ sucesso: true, mensagem: "Mensagem enviada com arquivos!", mensagem_id });

  } catch (err) {
    console.error("Erro ao enviar mensagem com arquivos:", err);
    res.status(500).json({ erro: "Erro ao enviar mensagem com arquivos" });
  }
});


// Rota GET para buscar mensagens paginadas com anexos
app.get("/mensagens", async (req, res) => {
  const pagina = parseInt(req.query.pagina) || 1;
  const limite = 50;
  const offset = (pagina - 1) * limite;

  try {
    // 1. Buscar mensagens
    const resultadoMensagens = await db.execute(`
      SELECT m.*, 
             u.nome_completo AS remetente_nome, 
             u2.nome_completo AS destinatario_nome
      FROM Mensagens m
      LEFT JOIN Usuarios u ON m.remetente_id = u.id
      LEFT JOIN Usuarios u2 ON m.destinatario_id = u2.id
      ORDER BY m.data_criacao DESC
      LIMIT ? OFFSET ?
    `, [limite, offset]);

    const mensagens = Array.isArray(resultadoMensagens) && resultadoMensagens.length > 0
      ? resultadoMensagens[0]
      : [];

    const ids = mensagens.map(m => m.id);
    console.log("IDs das mensagens:", ids);

    // 2. Buscar arquivos relacionados (se houver mensagens)
    let arquivos = [];

    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      const resultadoArquivos = await db.execute(
        `SELECT * FROM Arquivos_Mensagens WHERE mensagem_id IN (${placeholders})`,
        ids
      );

      arquivos = Array.isArray(resultadoArquivos) && resultadoArquivos.length > 0
        ? resultadoArquivos[0]
        : [];
    }

    // 3. Organizar arquivos por mensagem_id
    const arquivosPorMensagem = {};
    arquivos.forEach(arq => {
      if (!arquivosPorMensagem[arq.mensagem_id]) {
        arquivosPorMensagem[arq.mensagem_id] = [];
      }
      arquivosPorMensagem[arq.mensagem_id].push(arq);
    });

    // 4. Montar resposta com os arquivos embutidos
    const mensagensComArquivos = mensagens.map(msg => ({
      ...msg,
      arquivos: arquivosPorMensagem[msg.id] || []
    }));

    // 5. Enviar resposta
    res.json({ pagina, limite, mensagens: mensagensComArquivos });

  } catch (err) {
    console.error("Erro ao buscar mensagens:", err);
    res.status(500).json({ erro: "Erro ao buscar mensagens" });
  }
});

// Rota POST /mensagens — apenas texto, sem arquivos
app.post("/mensagens", async (req, res) => {
  const { remetente_id, destinatario_id, conteudo } = req.body;

  if (!remetente_id || !conteudo) {
    return res.status(400).json({ erro: "remetente_id e conteudo são obrigatórios" });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO Mensagens (remetente_id, destinatario_id, conteudo) VALUES (?, ?, ?)`,
      [remetente_id, destinatario_id || null, conteudo]
    );

    const mensagem_id = result.insertId;

    res.json({ sucesso: true, mensagem: "Mensagem enviada com sucesso!", mensagem_id });
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    res.status(500).json({ erro: "Erro ao enviar mensagem" });
  }
});


// Fim API do Chat 

// Inicio API das Tarefas

// Obter tarefas do usuário autenticado

app.get('/listar-tarefas', autenticarToken, async (req, res) => {
  const usuarioId = req.usuario.id; // id vindo do token validado
  console.log(usuarioId)
  try {
    db.query('SELECT * FROM Tarefas WHERE atribuido_id = ? ORDER BY data_vencimento ASC', [usuarioId], (error, result) => {
      if(error) {
        res.status(500).json({error: `Erro ao recuperar tarefas: ${JSON.stringify(error)}`});
      }
      res.status(200).json(result);
    });
    return;
    const [rows] = await db.execute(
      "SELECT * FROM Tarefas WHERE atribuido_id = ? ORDER BY data_vencimento ASC",
      [usuarioId]
    );
    console.log(rows);
    res.json(rows);
  } catch (err) {
    res.status(500).json({error: `Erro interno: ${JSON.stringify(err)}`})
    return;
    res.status(500).json({ erro: "Erro ao buscar tarefas." });
  }
});


app.post('/criar-tarefas', autenticarToken, async (req, res) => {
  console.log(JSON.stringify(req.body));
  const { titulo, prazo, status, prioridade } = req.body;
  const usuarioId = req.usuario.id; // Obtém o ID do usuário autenticado
  console.warn(`UsuarioID: ${usuarioId}`);

  if (!titulo || !prazo) {
    return res.status(400).json({ erro: "Título e prazo são obrigatórios." });
  }

  console.log("FOi")
  console.log(`Body: ${JSON.stringify(req.body)}`);

  try {
    db.query('INSERT INTO Tarefas (titulo, data_vencimento, status, complexidade, atribuido_id, criador_id) VALUES (?, ?, ?, ?, ?, ?)', [titulo, prazo, status, prioridade, usuarioId, usuarioId], (error, result) => {
      if(error) {
        res.status(500).json(`Erro ao cadastrar tarefa: ${JSON.stringify(error)}`)
        return;
      }
      res.status(201).json(`Sucesso ao criar tarefa!`)
    })
  } catch(error) {
    res.status(500).json(`Erro ao criar tarefa: ${JSON.stringify(error)}`)
  }
});

app.put('/atualizar-tarefa/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, data_vencimento, complexidade, status } = req.body;

  try {
    const [resultado] = await db.execute(
      "UPDATE Tarefas SET titulo = ?, data_vencimento = ?, complexidade = ?, status = ? WHERE id = ? AND usuario_id = ?",
      [titulo, data_vencimento, complexidade, status, id, req.usuario.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada ou não pertence ao usuário' });
    }

    res.json({ message: 'Tarefa atualizada com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar tarefa', details: err.message });
  }
});

app.delete('/excluir-tarefas/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.usuario.id; // Obtém o ID do usuário autenticado
  try {
    db.query('DELETE FROM Tarefas WHERE id = ?', [id], (error, result) => {
      if(error) {
        res.status(500).json(`Erro ao deletar tarefa: ${JSON.stringify(error)}`)
        return;
      }
      res.status(200).json('Sucesso ao deletar tarefa!')
    })
  } catch (err) {
    res.status(500).json({ erro: "Erro ao excluir tarefa." });
  }
});


// Fim API das Tarefas

// Chamada de video 
async function iniciarCamera() {
  const video = document.getElementById('userCamera');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
  } catch (err) {
    console.error('Erro ao acessar a câmera:', err);
    alert('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
  }
}

function abrirModal(id) {
  const modal = document.getElementById(id);
  modal.classList.remove('hidden');
  if (id === 'videoCallModal') {
    iniciarCamera();
  }
}

function fecharModal(id, encerrarCamera = false) {
  const modal = document.getElementById(id);
  modal.classList.add('hidden');

  if (encerrarCamera) {
    const video = document.getElementById('userCamera');
    const stream = video.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop()); // Para todas as faixas (ex: vídeo e áudio)
      video.srcObject = null;
    }
  }
}


// Perfil
app.put('/perfil/:id', (req, res) => {
  const { id } = req.params;
  const { 
    nome_completo = "",
    email = "",
    cargo = "",
    telefone = "",
    localizacao = "",
    avatar_url = ""
  } = req.body;

  try {
    db.query(`
      UPDATE Usuarios set nome_completo = ?,
      email = ?, cargo = ?, telefone = ?, localizacao = ?, avatar_url = ? WHERE id = ?
      `, [nome_completo, email, cargo, telefone, localizacao, avatar_url, id], (error, results) => {
        if (error) {
          console.error(JSON.stringify(error));
          res.status(500).json(`Não foi possível atualizar as informações!`);
        }
        res.status(200).json(`Sucesso ao atualizar as informações!`)
      })
  } catch(error) {
    console.log(`Error updating user: ${JSON.stringify(error)}`);
    res.status(500).json(`Não foi possível atualizar as informações!`);
  }
})


//Send Email

app.post('/Email', (req, res) => {
    const {nome} = req.body;
    db.query('INSERT INTO Departamentos (nome) VALUES ( ?)', 
        [nome], 
        (error, results) => {
        if (error) {
            return res.status(500).json({message: `Erro ao inserir Departamento: ${error}`});
        }
        res.status(201).json({message:'Departamento inserido com sucesso!'});
    });
});

app.post('/send-mail', async (req, res) => {
  console.log(JSON.stringify(req.body));
  const { email, assunto, mensagem } = req.body;
  try {
    const enterpriseMail = 'TalkyCs.Corporativo@gmail.com'
      //  let transporter = nodemailer.createTransport({
      //     // host: 'smtp.gmail.com', 
      //     // port: 587,
      //     // secure: false, 
      //     servie: 'gmail',
      //     auth: {
      //       user: '0001083187@senaimgaluno.com.br',
      //       pass: 'your_app_password'
      //     }
      //   });

      const transporter = await nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465
        auth: {
          user: enterpriseMail,
          pass: 'kial uzkd ihel iivo',
        },
      });
        console.log("entrou");
        // console.log(JSON.stringify(transporter));
        // let email = document.getElementById("email").value;
        // let assunto = document.getElementById("subject").value;
        // let mensagem = document.getElementById("message").value;

        const mailOptions = {
            from: `"Website Contact" <${enterpriseMail}>`, // Sender = your enterprise email
            to: enterpriseMail,                            // Receiver = also your enterprise email
            replyTo: email,
            subject: assunto,
            text: mensagem
        }

        console.log("Passou");

        await transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(`Erro de envio do email: ${JSON.stringify(error)}`);
            console.log(error);
            res.status(500).json(`Erro ao enviar emailÇ ${error}`);
            return;
          }
          console.log(`Email sent: ${info.response}`);
          res.status(200).json(`Email enviado com sucess!`);
        })

        // try {
        //   let info = await transporter.sendMail({
            

        //   })
        // } catch(error) {
        //   console.log(`Error: ${JSON.stringify(error)}`);
        // }

        console.log("mensagem enviada: %s",info.messageId);
  } catch(error) {
    res.status(500).json({error: `Erro ao enviar email: ${JSON.stringify(error)}`});
  }
})



async function sendMail() {

  let transporter = await nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 587,
    secure: false, 
    auth: {
      user: 'TalkyCs.Corporativo@gmail.com',
      pass: 'tsdwd bsxo mydj bbcv'
    }
  });
  console.log("entrou");

  let email = document.getElementById("email").value;
  let assunto = document.getElementById("subject").value;
  let mensagem = document.getElementById("message").value;

  let info = await transporter.sendMail({
    from: email,
    to: 'TalkyCs.Corporativo@gmail.com',
    subject: assunto,
    text: mensagem

  })

   console.log("mensagem enviada: %s",info.massageId);
};

  // enviarEmail().catch(console.error);

app.listen(port, () => {
    console.log(`Api rodando em http://localhost:${port}`);
});




  
  