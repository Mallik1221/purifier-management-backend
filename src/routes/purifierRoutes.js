const express = require('express');
const router = express.Router();
const purifierController = require('../controllers/purifierController');

router.get('/', purifierController.getAllPurifiers);
router.post('/', purifierController.createPurifier);
router.put('/:id', purifierController.updatePurifier);
router.delete('/:id', purifierController.deletePurifier);
router.patch('/:id/toggle-status', purifierController.togglePurifierStatus);

module.exports = router;