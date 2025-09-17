const bcrypt = require('bcrypt');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class AuthService {
  async createUser(name, password, isTemporary = false) {
    const saltRounds = isTemporary ? 8 : 12;
    const userId = uuidv4();
    let expiresAt = null;
    if (isTemporary) expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.execute(
      'INSERT INTO user (id, name, password_hash, is_temporary, expires_at) VALUES (?, ?, ?, ?, ?)',
      [userId, name, '', isTemporary ? 1 : 0, expiresAt]
    );

    bcrypt.hash(password, saltRounds).then(passwordHash => {
      db.execute(
        'UPDATE user SET password_hash = ? WHERE id = ?',
        [passwordHash, userId]
      ).catch(console.error);
    });

    const token = generateToken(userId);

    return {
      user: {
        id: userId,
        name,
        is_temporary: isTemporary ? 1 : 0,
        expires_at: expiresAt,
        created_at: new Date()
      },
      token
    };
  }

  async findUserByName(name) {
    const connection = await db.getConnection();
    try {
      const [users] = await connection.execute(
        'SELECT id, name, is_temporary, expires_at FROM user WHERE name = ?',
        [name]
      );
      return users.length > 0 ? users[0] : null;
    } finally {
      connection.release();
    }
  }

  async createTemporaryUser(name) {
    const connection = await db.getConnection();
    try {
      const existingUser = await this.findUserByName(name);
      if (existingUser) {
        throw new Error('Nome de usuário já existe');
      }

      const tempPassword = crypto.randomBytes(8).toString('hex');
      return await this.createUser(name, tempPassword, true);
    } finally {
      connection.release();
    }
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

    }

module.exports = new AuthService();
