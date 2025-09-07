CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    password_hash VARCHAR(255),

    -- identifica se é usuário temporário ou permanente
    is_temporary BOOLEAN DEFAULT FALSE,

    -- data de expiração só usada para temporários
    expires_at DATETIME NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
