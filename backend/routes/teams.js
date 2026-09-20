const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsController');
const { requireAdmin } = require('../middleware/auth');

router.get('/', teamsController.getTeams);
router.get('/:id', teamsController.getTeamById);
router.put('/:id', requireAdmin, teamsController.updateTeam);

module.exports = router;
