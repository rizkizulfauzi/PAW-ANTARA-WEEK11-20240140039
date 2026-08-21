const express = require('express');
const router = express.Router();
const { renderHome, renderAdminDashboard } = require('../controllers/page.controller');

router.get('/', renderHome);
router.get('/admin', renderAdminDashboard);

module.exports = router;
