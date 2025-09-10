const db = require('../config/database');

class CommentService {
    async createMessage(userId, content, messageType = 'text', nome) {
        const connection = await db.getConnection();
        try {
            const [result] = await connection.execute(
                'INSERT INTO message (idUser, content, message_type) VALUES (?, ?, ?)',
                [userId, content, messageType]
            );

            let messages;

            if(!nome) {
                [messages] = await connection.execute(`
                    SELECT m.*, u.name as user_name 
                    FROM message m 
                    JOIN user u ON m.idUser = u.id 
                    WHERE m.id = ?
                `, [result.insertId]);
            } else {
                messages = [{
                    id: result.insertId,
                    idUser: userId,
                    content: content,
                    message_type: messageType,
                    user_name: nome,
                    created_at: new Date()
                }];
                console.log("retornou", messages[0]);
            }

            return messages[0];
        } catch (err) {
            throw err;
        } finally {
            connection.release();
        }
    }

    async getMessages(limit = 50, offset = 0) {
        const connection = await db.getConnection();
        try {
            const [messages] = await connection.execute(`
                SELECT m.*, u.name as user_name 
                FROM message m 
                JOIN user u ON m.idUser = u.id 
                ORDER BY m.created_at DESC 
                LIMIT ? OFFSET ?
            `, [limit, offset]);

            return messages.reverse();
        } finally {
            connection.release();
        }
    }

    async getMessageById(messageId) {
        const connection = await db.getConnection();
        try {
            const [messages] = await connection.execute(`
                SELECT m.*, u.name as user_name 
                FROM message m 
                JOIN user u ON m.idUser = u.id 
                WHERE m.id = ?
            `, [messageId]);

            return messages.length > 0 ? messages[0] : null;
        } finally {
            connection.release();
        }
    }

    async deleteMessage(messageId, userId) {
        const connection = await db.getConnection();
        try {
            const [messages] = await connection.execute(
                'SELECT idUser FROM message WHERE id = ?',
                [messageId]
            );

            if (messages.length === 0) {
                throw new Error('Mensagem não encontrada');
            }

            if (messages[0].idUser !== userId) {
                throw new Error('Não autorizado a excluir esta mensagem');
            }

            await connection.execute(
                'DELETE FROM message WHERE id = ?',
                [messageId]
            );

            return true;
        } finally {
            connection.release();
        }
    }

    async getUserMessages(userId, limit = 20) {
        const connection = await db.getConnection();
        try {
            const [messages] = await connection.execute(`
                SELECT m.*, u.name as user_name 
                FROM message m 
                JOIN user u ON m.idUser = u.id 
                WHERE m.idUser = ? 
                ORDER BY m.created_at DESC 
                LIMIT ?
            `, [userId, limit]);

            return messages;
        } finally {
            connection.release();
        }
    }
}

module.exports = new CommentService();