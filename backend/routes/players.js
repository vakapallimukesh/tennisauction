const express = require('express');
const router = express.Router();
const playersController = require('../controllers/playersController');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/', playersController.getPlayers);
router.get('/:id', playersController.getPlayerById);
router.post('/', authenticateAdmin, playersController.createPlayer);
router.put('/:id', authenticateAdmin, playersController.updatePlayer);
router.delete('/:id', authenticateAdmin, playersController.deletePlayer);

module.exports = router;
