const express = require('express');
const router = express.Router();
const playersController = require('../controllers/playersController');
const { requireAdmin } = require('../middleware/auth');

router.get('/', playersController.getPlayers);
router.get('/:id', playersController.getPlayerById);
router.post('/', requireAdmin, playersController.createPlayer);
router.put('/:id', requireAdmin, playersController.updatePlayer);
router.delete('/:id', requireAdmin, playersController.deletePlayer);

module.exports = router;
