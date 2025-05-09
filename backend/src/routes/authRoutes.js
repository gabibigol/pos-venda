const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AuditLogService = require('../services/AuditLogService');

// Rota de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuário pelo email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Log de tentativa de login com usuário inexistente
      await AuditLogService.logAccessDenied({
        route: req.path,
        method: req.method,
        reason: 'User not found',
        email,
        ipAddress: req.ip
      });

      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isMatch = await user.checkPassword(password);

    if (!isMatch) {
      // Log de tentativa de login com senha incorreta
      await AuditLogService.logAccessDenied({
        route: req.path,
        method: req.method,
        reason: 'Invalid password',
        email,
        userId: user.id,
        ipAddress: req.ip
      });

      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar status do usuário
    if (user.status !== 'ACTIVE') {
      await AuditLogService.logAccessDenied({
        route: req.path,
        method: req.method,
        reason: 'Inactive user',
        email,
        userId: user.id,
        ipAddress: req.ip
      });

      return res.status(403).json({ message: 'Conta de usuário inativa' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION || '24h'
      }
    );

    // Atualizar último login
    await user.update({ lastLogin: new Date() });

    // Log de login bem-sucedido
    await AuditLogService.logLogin({
      userId: user.id,
      email: user.email,
      ipAddress: req.ip
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);

    await AuditLogService.logError({
      message: 'Login error',
      error: error.message,
      route: req.path,
      method: req.method
    });

    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;
