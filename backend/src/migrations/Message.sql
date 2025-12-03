CREATE TABLE message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUser CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (idUser) REFERENCES user(id) ON DELETE CASCADE,
    
    INDEX idx_message_idUser (idUser),
    INDEX idx_message_created_at (created_at)
);