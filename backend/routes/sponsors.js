const express = require('express');
const router = express.Router();
const sponsorsController = require('../controllers/sponsorsController');

router.get('/', sponsorsController.getSponsors);

module.exports = router;
