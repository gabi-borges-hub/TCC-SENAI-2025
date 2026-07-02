
CREATE DATABASE IF NOT EXISTS bancoTCC 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE bancoTCC;

CREATE TABLE IF NOT EXISTS Departamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    CONSTRAINT uk_departamento_nome UNIQUE (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    departamento_id INT,
    cargo VARCHAR(100),
    telefone VARCHAR(20),
    localizacao VARCHAR(100),
    avatar_url VARCHAR(255),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP NULL,
    ativo BOOLEAN DEFAULT TRUE,
    verificado BOOLEAN DEFAULT FALSE,
    CONSTRAINT uk_usuario_email UNIQUE (email),
    CONSTRAINT fk_usuario_departamento FOREIGN KEY (departamento_id) 
        REFERENCES Departamentos(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS perfis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    bio TEXT,
    visibilidade ENUM('privado', 'equipe', 'publico') DEFAULT 'equipe',
    notificacoes_email BOOLEAN DEFAULT TRUE,
    notificacoes_push BOOLEAN DEFAULT TRUE,
    modo_ausente BOOLEAN DEFAULT FALSE,
    tema_preferido ENUM('claro', 'escuro', 'sistema') DEFAULT 'claro',
    idioma VARCHAR(10) DEFAULT 'pt-BR',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_perfil_usuario UNIQUE (usuario_id),
    CONSTRAINT fk_perfil_usuario FOREIGN KEY (usuario_id) 
        REFERENCES Usuarios(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Habilidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_habilidade_nome UNIQUE (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Habilidades_Usuarios (
    usuario_id INT NOT NULL,
    habilidade_id INT NOT NULL,
    nivel ENUM('iniciante', 'intermediario', 'avancado', 'especialista') DEFAULT 'intermediario',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, habilidade_id),
    CONSTRAINT fk_hu_usuario FOREIGN KEY (usuario_id) 
        REFERENCES Usuarios(Id) ON DELETE CASCADE,
    CONSTRAINT fk_hu_habilidade FOREIGN KEY (habilidade_id) 
        REFERENCES Habilidades(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Grupos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    criador_id INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    visibilidade ENUM('privado', 'publico') DEFAULT 'privado',
    CONSTRAINT uk_grupo_nome UNIQUE (nome),
    CONSTRAINT fk_grupo_criador FOREIGN KEY (criador_id) 
        REFERENCES Usuarios(Id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Membros_Grupos (
    grupo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    cargo ENUM('membro', 'moderador', 'administrador') DEFAULT 'membro',
    PRIMARY KEY (grupo_id, usuario_id),
    CONSTRAINT fk_mg_grupo FOREIGN KEY (grupo_id) 
        REFERENCES Grupos(id) ON DELETE CASCADE,
    CONSTRAINT fk_mg_usuario FOREIGN KEY (usuario_id) 
        REFERENCES Usuarios(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Projetos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    lider_id INT NOT NULL,
    departamento_id INT,
    data_inicio DATE,
    data_termino DATE,
    status ENUM('planejamento', 'andamento', 'pausado', 'concluido', 'cancelado') DEFAULT 'planejamento',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_projeto_nome UNIQUE (nome),
    CONSTRAINT fk_projeto_lider FOREIGN KEY (lider_id) 
        REFERENCES Usuarios(Id),
    CONSTRAINT fk_projeto_departamento FOREIGN KEY (departamento_id) 
        REFERENCES Departamentos(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Membros_Projetos (
    projeto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cargo VARCHAR(100),
    PRIMARY KEY (projeto_id, usuario_id),
    CONSTRAINT fk_mp_projeto FOREIGN KEY (projeto_id) 
        REFERENCES Projetos(Id) ON DELETE CASCADE,
    CONSTRAINT fk_mp_usuario FOREIGN KEY (usuario_id) 
        REFERENCES Usuarios(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    criador_id INT NOT NULL,
    atribuido_id INT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    data_vencimento DATETIME,
    data_conclusao DATETIME NULL,
    status ENUM('pendente', 'em_andamento', 'concluida', 'cancelada') DEFAULT 'pendente',
    projeto_id INT NULL,
    FOREIGN KEY (criador_id) REFERENCES Usuarios(Id),
    FOREIGN KEY (atribuido_id) REFERENCES Usuarios(Id),
    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Comentarios_Tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarefa_id INT NOT NULL,
    usuario_id INT NOT NULL,
    conteudo TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_comentario_tarefa FOREIGN KEY (tarefa_id) 
        REFERENCES Tarefas(id) ON DELETE CASCADE,
    CONSTRAINT fk_comentario_usuario FOREIGN KEY (usuario_id) 
        REFERENCES Usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 

CREATE TABLE IF NOT EXISTS Arquivos_Tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarefa_id INT NOT NULL,
    usuario_id INT NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(512) NOT NULL,
    tipo_arquivo VARCHAR(100),
    tamanho INT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_arquivo_tarefa FOREIGN KEY (tarefa_id) 
        REFERENCES Tarefas(id) ON DELETE CASCADE,
    CONSTRAINT fk_arquivo_usuario FOREIGN KEY (usuario_id) 
        REFERENCES Usuarios(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remetente_id INT NOT NULL,
    destinatario_id INT NULL,
    grupo_id INT NULL,
    conteudo TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_mensagem_remetente FOREIGN KEY (remetente_id) 
        REFERENCES Usuarios(Id),
    CONSTRAINT fk_mensagem_destinatario FOREIGN KEY (destinatario_id) 
        REFERENCES Usuarios(Id),
    CONSTRAINT fk_mensagem_grupo FOREIGN KEY (grupo_id) 
        REFERENCES Grupos(id),
    CONSTRAINT chk_mensagem_destino CHECK (destinatario_id IS NOT NULL OR grupo_id IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Arquivos_Mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensagem_id INT NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(512) NOT NULL,
    tipo_arquivo VARCHAR(100),
    tamanho INT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_arquivo_mensagem FOREIGN KEY (mensagem_id) 
        REFERENCES Mensagens(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Configuracoes_Seguranca (
    usuario_id INT NOT NULL PRIMARY KEY,
    autenticacao_dois_fatores BOOLEAN DEFAULT FALSE,
    metodo_autenticacao ENUM('email', 'sms', 'app') DEFAULT 'email',
    notificacoes_login BOOLEAN DEFAULT TRUE,
    bloqueio_automatico INT DEFAULT 30,
    historico_senhas TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_config_usuario FOREIGN KEY (usuario_id) 
        REFERENCES Usuarios(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Logs_Acesso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    endereco_ip VARCHAR(45) NOT NULL,
    dispositivo VARCHAR(255),
    navegador VARCHAR(100),
    sistema_operacional VARCHAR(100),
    localizacao VARCHAR(100),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acao VARCHAR(50) NOT NULL,
    status VARCHAR(50),
    CONSTRAINT fk_log_usuario FOREIGN KEY (usuario_id) 
        REFERENCES Usuarios(Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Atividades_Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_atividade VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_atividade_usuario FOREIGN KEY (usuario_id) 
        REFERENCES Usuarios(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Administradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nivel_acesso ENUM('suporte', 'moderador', 'superadmin') DEFAULT 'moderador',
    permissoes JSON,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    criado_por INT,
    CONSTRAINT uk_admin_usuario UNIQUE (usuario_id),
    CONSTRAINT fk_admin_usuario FOREIGN KEY (usuario_id) 
        REFERENCES Usuarios(Id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_criador FOREIGN KEY (criado_por) 
        REFERENCES Administradores(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Recuperacao_Senha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    data_expiracao DATETIME NOT NULL,
    utilizado BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recuperacao_usuario FOREIGN KEY (usuario_id) 
        REFERENCES Usuarios(Id) ON DELETE CASCADE,
    CONSTRAINT uk_recuperacao_token UNIQUE (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Sessoes_Ativas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token_sessao VARCHAR(255) NOT NULL,
    dispositivo VARCHAR(255),
    endereco_ip VARCHAR(45),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_expiracao DATETIME NOT NULL,
    valida BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_sessao_usuario FOREIGN KEY (usuario_id) 
        REFERENCES Usuarios(Id) ON DELETE CASCADE,
    CONSTRAINT uk_sessao_token UNIQUE (token_sessao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Configuracoes_Sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) NOT NULL,
    valor TEXT,
    descricao TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_config_chave UNIQUE (chave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cor VARCHAR(20) DEFAULT '#3498db',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_tag_nome UNIQUE (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS Tarefas_Tags (
    tarefa_id INT NOT NULL,
    tag_id INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tarefa_id, tag_id),
    CONSTRAINT fk_tt_tarefa FOREIGN KEY (tarefa_id) 
        REFERENCES Tarefas(id) ON DELETE CASCADE,
    CONSTRAINT fk_tt_tag FOREIGN KEY (tag_id) 
        REFERENCES Tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Departamentos(nome) VALUES("TI");
INSERT INTO Departamentos(nome) VALUES("Recursos Humanos");
INSERT INTO Departamentos(nome) VALUES("Financeiro");
INSERT INTO Departamentos(nome) VALUES("Marketing");


ALTER TABLE tarefas
ADD COLUMN complexidade ENUM('simples', 'moderada', 'complexa') DEFAULT 'moderada',
ADD COLUMN tempo_estimado INT COMMENT 'Tempo estimado em minutos';

DELIMITER //

CREATE TRIGGER  atualiza_data_conclusao_tarefa
BEFORE UPDATE ON tarefas
FOR EACH ROW
BEGIN
    IF NEW.status = 'concluida' AND (OLD.status != 'concluida' OR OLD.status IS NULL) THEN
        SET NEW.data_conclusao = NOW();
    ELSEIF OLD.status = 'concluida' AND NEW.status != 'concluida' THEN
        SET NEW.data_conclusao = NULL;
    END IF;
END//
 

 
CREATE TRIGGER log_alteracoes_tarefa
AFTER UPDATE ON tarefas
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO atividades_usuarios (
            usuario_id, 
            tipo_atividade, 
            descricao,
            data_criacao
        )
        VALUES (
            NEW.atribuido_id, 
            'STATUS_TAREFA', 
            CONCAT('Status da tarefa "', NEW.titulo, '" alterado de ', OLD.status, ' para ', NEW.status),
            NOW()
        );
    END IF;
END//

DELIMITER ;