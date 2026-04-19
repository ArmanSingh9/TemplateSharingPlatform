const express = require('express');
const router = express.Router();
const {
    getTemplates,
    getTemplateById,
    uploadTemplate,
    downloadTemplate,
    rateTemplate,
    deleteTemplate,
    getMyTemplates
} = require('../controllers/templateController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getTemplates)
    .post(protect, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }]), uploadTemplate);

router.get('/my/templates', protect, getMyTemplates);

router.route('/:id')
    .get(getTemplateById)
    .delete(protect, deleteTemplate);

router.get('/:id/download', downloadTemplate); // Or protect if only users can download
router.post('/:id/rate', protect, rateTemplate);

module.exports = router;
