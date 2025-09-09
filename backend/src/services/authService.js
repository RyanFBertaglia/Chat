const bcrypt = require('bcrypt');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');

class AuthService {
    async createUser(name, password, isTemporary = false) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [existingUsers] = await connection.execute(
                'SELECT id FROM user WHERE name = ?',
                [name]
            );

            if (existingUsers.length > 0) {
                throw new Error('Nome de usuário já existe');
            }

            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            let expiresAt = null;
            if (isTemporary) {
                expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
            }

            const [result] = await connection.execute(
                'INSERT INTO user (name, password_hash, is_temporary, expires_at) VALUES (?, ?, ?, ?)',
                [name, passwordHash, isTemporary, expiresAt]
            );

            const [users] = await connection.execute(
                'SELECT id, name, is_temporary, expires_at, created_at FROM user WHERE id = ?',
                [result.insertId]
            );

            await connection.commit();

            const user = users[0];
            const token = generateToken(user.id);

            return {
                user,
                token
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async createTemporaryUser() {
        const tempName = `Convidado_${Math.random().toString(36).substr(2, 9)}`;
        return this.createUser(tempName, Math.random().toString(36), true);
    }

    async authenticateUser(name, password) {
        const connection = await db.getConnection();
        try {
            const [users] = await connection.execute(
                'SELECT id, name, password_hash, is_temporary, expires_at FROM user WHERE name = ?',
                [name]
            );

            if (users.length === 0) {
                throw new Error('Usuário não encontrado');
            }

            const user = users[0];

            if (user.is_temporary && new Date() > new Date(user.expires_at)) {
                throw new Error('Sessão expirada');
            }

            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                throw new Error('Senha incorreta');
            }

            const token = generateToken(user.id);

            return {
                user: {
                    id: user.id,
                    name: user.name,
                    is_temporary: user.is_temporary,
                    expires_at: user.expires_at
                },
                token
            };
        } finally {
            connection.release();
        }
    }

    async getUserById(userId) {
        const connection = await db.getConnection();
        try {
            const [users] = await connection.execute(
                'SELECT * FROM user WHERE id = ?',
                [userId]
            );

            return users.length > 0 ? users[0] : null;
        } finally {
            connection.release();
        }
    }

    async cleanupExpiredUsers() {
        const connection = await db.getConnection();
        try {
            await connection.execute(
                'DELETE FROM user WHERE is_temporary = TRUE AND expires_at < NOW()'
            );
        } finally {
            connection.release();
        }
    }
}

module.exports = new AuthService();