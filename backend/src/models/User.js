const pool = require('../config/database');

class User {
    static async create(userData) {
        const { name, password_hash, is_temporary, expires_at } = userData;
        
        const query = `
            INSERT INTO users (name, password_hash, is_temporary, expires_at)
            VALUES (?, ?, ?, ?)
        `;
        
        const [result] = await pool.execute(query, [
            name, 
            password_hash, 
            is_temporary, 
            expires_at
        ]);
        
        return result.insertId;
    }

    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    }

    static async findByName(name) {
        const query = 'SELECT * FROM users WHERE name = ?';
        const [rows] = await pool.execute(query, [name]);
        return rows[0];
    }

    static async findActiveUsers() {
        const query = `
            SELECT * FROM users 
            WHERE is_temporary = FALSE 
               OR (is_temporary = TRUE AND expires_at > NOW())
            ORDER BY created_at DESC
        `;
        const [rows] = await pool.execute(query);
        return rows;
    }

    static async cleanupExpiredUsers() {
        const query = 'DELETE FROM users WHERE is_temporary = TRUE AND expires_at <= NOW()';
        const [result] = await pool.execute(query);
        return result.affectedRows;
    }
}

module.exports = User;