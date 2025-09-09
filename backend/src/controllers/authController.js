const authService = require('../services/authService');

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;
            const result = await authService.login(nome, password);
      
      res.json(result);
      
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }
};

module.exports = authController;