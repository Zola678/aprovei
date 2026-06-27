-- PostgreSQL Schema Completo para APROVEI (Versão Final)

-- 1. Usuários e Autenticação
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL -- 'student', 'teacher', 'admin'
);
CREATE INDEX idx_users_email ON users(email);

-- 2. Provas e Materiais
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    university VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    pdf_url VARCHAR(500) NOT NULL,
    category VARCHAR(50)
);
CREATE INDEX idx_exams_university ON exams(university);
CREATE INDEX idx_exams_category ON exams(category);

-- 3. Marketplace de Professores
CREATE TABLE teacher_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR(255),
    bio TEXT,
    price_per_hour INTEGER
);

-- 4. Comunidade e Fórum
CREATE TABLE forum_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_forum_created_at ON forum_posts(created_at);

-- 5. Pagamentos (Novo Módulo)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    gateway_transaction_id VARCHAR(255),
    description VARCHAR(255), -- Ex: 'Assinatura Premium Mensal'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
