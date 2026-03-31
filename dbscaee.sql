-- ============================================================
-- SCAEE — Schema do banco de dados
-- ============================================================

CREATE DATABASE IF NOT EXISTS dbscaee
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE dbscaee;

CREATE TABLE IF NOT EXISTS `usuario` (
  `id`        INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `email`     VARCHAR(120)    NOT NULL,
  `senha`     VARCHAR(255)    NOT NULL,
  `nome`     VARCHAR(100)    NOT NULL,
  `tipo`      ENUM('Gestão','Professor','Recepção') NOT NULL,
  `criado_em` DATETIME        DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `eventos` (
  `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `titulo`     VARCHAR(100)  NOT NULL,
  `tipo`       ENUM('Interno','Aberto','Convidado') NOT NULL,
  `startdate`  DATE          NOT NULL,
  `enddate`    DATE          NOT NULL,
  `startime`   TIME          NOT NULL,
  `endtime`    TIME          NOT NULL,
  `local1`     VARCHAR(50)   NOT NULL,
  `nome`       VARCHAR(100)  NOT NULL,
  `base`       VARCHAR(50)   NOT NULL,
  `ano`        VARCHAR(10)   NOT NULL,
  `curso`      VARCHAR(80)   NOT NULL,
  `coord`      VARCHAR(80)   NOT NULL,
  `color`      VARCHAR(10)   NOT NULL,
  `info_event` VARCHAR(500)  NOT NULL,
  `criado_por` INT UNSIGNED  NULL,
  `criado_por_email` VARCHAR(120) NULL,
  `criado_em`  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`criado_por`) REFERENCES `usuario`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `tokens_recuperacao` (
  `email`     VARCHAR(120) NOT NULL,
  `token`     VARCHAR(64)  NOT NULL,
  `expira_em` DATETIME     NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Usuários de exemplo (senha: 123456) ──────────────────────
INSERT INTO `usuario` (`email`, `senha`, `nome`, `tipo`) VALUES
  ('gestao@escola.edu.br',    '123', 'gestao', 'Gestão'),
  ('professor@escola.edu.br', '123', 'professor', 'Professor'),
  ('recepcao@escola.edu.br', '123', 'recpecao', 'Recepção');
