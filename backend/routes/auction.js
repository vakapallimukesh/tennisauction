const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const { authenticateJWT, requireAdmin } = require('../middleware/auth');

// Public read routes
router.get('/state', auctionController.getAuctionState);

// Auction action routes: Bid allowed for authenticated teams or admin
router.post('/bid', authenticateJWT, auctionController.placeBid);

// Admin-only controls
router.post('/undo-bid', requireAdmin, auctionController.undoLastBid);
router.post('/sell', requireAdmin, auctionController.markSold);
router.post('/pass', requireAdmin, auctionController.markUnsold);
router.post('/next-player', requireAdmin, auctionController.nextPlayer);
router.post('/set-live', requireAdmin, auctionController.setLivePlayer);
router.post('/control', requireAdmin, auctionController.controlAuction);
router.post('/timer-tick', auctionController.tickTimer);

module.exports = router;
