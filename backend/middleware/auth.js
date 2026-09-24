const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is not set. Server cannot start securely.');
  console.error('   Set JWT_SECRET in your .env file or environment variables before starting the server.');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Allow local development / testing admin fallback
    if (process.env.NODE_ENV !== 'production') {
      req.user = { id: 1, username: 'admin', role: 'admin', full_name: 'Tournament Director' };
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided. Please log in.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      req.user = { id: 1, username: 'admin', role: 'admin', full_name: 'Tournament Director' };
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
}

// Admin only middleware
function requireAdmin(req, res, next) {
  authenticateJWT(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access forbidden. Administrator privileges required.'
      });
    }
  });
}

// Team specific authorization (Team 1 can only bid/view for Team 1)
function requireTeam(teamIdParam = 'id') {
  return (req, res, next) => {
    authenticateJWT(req, res, () => {
      const targetTeamId = parseInt(req.params[teamIdParam] || req.body.team_id, 10);
      if (req.user.role === 'admin' || req.user.team_id === targetTeamId) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: `Access denied. You do not have permission to manage or bid for Team ${targetTeamId}.`
        });
      }
    });
  };
}

module.exports = {
  JWT_SECRET,
  authenticateJWT,
  requireAdmin,
  requireTeam
};
