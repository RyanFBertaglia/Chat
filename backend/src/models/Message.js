const pool = require('../config/database');

class Message {
    static async create(message) {
        const { idUser, content, message_type, created_at } = messageData;
    }

    static returnDTO(message) {
        return new MessageDTO(
            message.id,
            message.idUser,
            message.content,
            message.created_at,
            message.message_type,
            message.user_name
        );
    }
}