const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLogService = require('../services/AuditLogService');

class AuthMiddleware {
  /**
   * Middleware para verificação de token JWT
   */
  static async authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      await AuditLogService.logAccessDenied({
        route: req.path,
        method: req.method,
        reason: 'No token provided',
        ipAddress: req.ip
      });

      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
        {
          algorithms: ['HS256'],
          maxAge: process.env.JWT_EXPIRATION || '24h'
        }
      );

      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'role', 'email', 'status']
      });

      if (!user) {
        await AuditLogService.logAccessDenied({
          route: req.path,
          method: req.method,
          reason: 'User not found',
          userId: decoded.id,
          ipAddress: req.ip
        });

        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      if (user.status !== 'ACTIVE') {
        await AuditLogService.logAccessDenied({
          route: req.path,
          method: req.method,
          reason: 'Inactive user',
          userId: user.id,
          ipAddress: req.ip
        });

        return res.status(403).json({ error: 'Conta de usuário inativa' });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      next();
    } catch (error) {
      await AuditLogService.logAccessDenied({
        route: req.path,
        method: req.method,
        reason: error.name,
        ipAddress: req.ip
      });

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' });
      }

      return res.status(403).json({ error: 'Token inválido' });
    }
  }

  /**
   * Middleware para verificar permissões de acesso
   * @param {string[]} allowedRoles - Funções permitidas
   */
  static checkPermissions(allowedRoles) {
    return async (req, res, next) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        await AuditLogService.logAccessDenied({
          route: req.path,
          method: req.method,
          reason: 'Insufficient permissions',
          userId: req.user?.id,
          userRole: req.user?.role,
          requiredRoles: allowedRoles,
          ipAddress: req.ip
        });

        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem permissão para acessar este recurso'
        });
      }
      next();
    };
  }
}

module.exports = AuthMiddleware;
