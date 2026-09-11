const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const { authenticateAdmin } = require('../middleware/auth');

// Public read routes
router.get('/state', auctionController.getAuctionState);

// Auction action routes (Protected with authenticateAdmin)
router.post('/bid', authenticateAdmin, auctionController.placeBid);
router.post('/undo-bid', authenticateAdmin, auctionController.undoLastBid);
router.post('/sell', authenticateAdmin, auctionController.markSold);
router.post('/pass', authenticateAdmin, auctionController.markUnsold);
router.post('/next-player', authenticateAdmin, auctionController.nextPlayer);
router.post('/set-live', authenticateAdmin, auctionController.setLivePlayer);
router.post('/control', authenticateAdmin, auctionController.controlAuction);
router.post('/timer-tick', auctionController.tickTimer);

module.exports = router;
