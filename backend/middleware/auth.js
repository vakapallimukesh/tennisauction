const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tennis_auction_super_secret_jwt_key_2026';

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
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
