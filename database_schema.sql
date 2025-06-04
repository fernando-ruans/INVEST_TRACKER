-- Investment Tracker Database Schema
-- Script para criação completa do banco de dados
-- Compatível com PostgreSQL

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para a tabela users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Tabela de portfólios
CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para a tabela portfolios
CREATE INDEX IF NOT EXISTS idx_portfolios_name ON portfolios(name);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);

-- Tabela de ativos do portfólio
CREATE TABLE IF NOT EXISTS portfolio_assets (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    average_price DECIMAL(20, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para a tabela portfolio_assets
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_portfolio_id ON portfolio_assets(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_symbol ON portfolio_assets(symbol);

-- Tabela de watchlists
CREATE TABLE IF NOT EXISTS watchlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para a tabela watchlists
CREATE INDEX IF NOT EXISTS idx_watchlists_name ON watchlists(name);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);

-- Tabela de itens da watchlist
CREATE TABLE IF NOT EXISTS watchlist_items (
    id SERIAL PRIMARY KEY,
    watchlist_id INTEGER NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para a tabela watchlist_items
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_id ON watchlist_items(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_symbol ON watchlist_items(symbol);

-- Tabela de verificação de usuários
CREATE TABLE IF NOT EXISTS user_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verification_code VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP
);

-- Índices para a tabela user_verifications
CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id ON user_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_code ON user_verifications(verification_code);

-- Tabela de reset de senha
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reset_code VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP
);

-- Índices para a tabela password_resets
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_code ON password_resets(reset_code);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_assets_updated_at BEFORE UPDATE ON portfolio_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watchlists_updated_at BEFORE UPDATE ON watchlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE portfolios IS 'Tabela de portfólios de investimento';
COMMENT ON TABLE portfolio_assets IS 'Tabela de ativos dentro dos portfólios';
COMMENT ON TABLE watchlists IS 'Tabela de listas de observação';
COMMENT ON TABLE watchlist_items IS 'Tabela de itens das listas de observação';
COMMENT ON TABLE user_verifications IS 'Tabela para verificação de email dos usuários';
COMMENT ON TABLE password_resets IS 'Tabela para reset de senhas';

-- Comentários nas colunas importantes
COMMENT ON COLUMN users.avatar IS 'Caminho ou URL para a imagem de avatar do usuário';
COMMENT ON COLUMN users.is_active IS 'Indica se o usuário está ativo no sistema';
COMMENT ON COLUMN users.is_verified IS 'Indica se o email do usuário foi verificado';
COMMENT ON COLUMN portfolio_assets.quantity IS 'Quantidade do ativo no portfólio';
COMMENT ON COLUMN portfolio_assets.average_price IS 'Preço médio de compra do ativo';

-- Inserir dados iniciais (opcional)
-- INSERT INTO users (email, username, full_name, hashed_password, is_active, is_verified)
-- VALUES ('admin@example.com', 'admin', 'Administrador', '$2b$12$...', true, true);

PRINT 'Schema do Investment Tracker criado com sucesso!';