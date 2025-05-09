const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middlewares/authMiddleware');

// Rota protegida genérica
router.get('/', AuthMiddleware.authenticateToken, (req, res) => {
  res.json({
    message: 'Rota protegida acessada com sucesso!',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Rota com verificação de permissão específica
router.get('/admin',
  AuthMiddleware.authenticateToken,
  AuthMiddleware.checkPermissions(['ADMIN']),
  (req, res) => {
    res.json({
      message: 'Rota administrativa acessada com sucesso!',
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role
      }
    });
  });

module.exports = router;
