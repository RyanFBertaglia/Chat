const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'aviaosemasa';

const authMiddleware = async (req, res, next) => {
    try {        
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token de acesso não fornecido' });
        }

        const token = authHeader.substring(7);
        
        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({ error: 'Token inválido' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        req.user = { id: decoded.userId };
        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }
        res.status(500).json({ error: 'Erro na autenticação' });
    }
};

const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

const returnIdFromToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.userId;
    } catch (error) {
        return null;
    }
};

module.exports = {
    authMiddleware,
    generateToken
};