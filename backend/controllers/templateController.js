const Template = require('../models/Template');
const Rating = require('../models/Rating');
const fs = require('fs');
const path = require('path');

// @desc    Get all templates (with search & filtering)
// @route   GET /api/templates
const getTemplates = async (req, res) => {
    try {
        const { search, category, subject, sort } = req.query;
        let query = {};
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (category) query.category = category;
        if (subject) query.subject = subject;

        let sortOption = { createdAt: -1 }; // default newest
        if (sort === 'popular') sortOption = { downloads: -1, averageRating: -1 };
        if (sort === 'rating') sortOption = { averageRating: -1 };

        const templates = await Template.find(query)
            .populate('uploadedBy', 'name')
            .sort(sortOption);
            
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single template
// @route   GET /api/templates/:id
const getTemplateById = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id)
            .populate('uploadedBy', 'name email');
            
        if (template) {
            res.json(template);
        } else {
            res.status(404).json({ message: 'Template not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload a template
// @route   POST /api/templates
const uploadTemplate = async (req, res) => {
    try {
        if (!req.files || !req.files['file']) {
            return res.status(400).json({ message: 'Please upload a template file' });
        }

        const templateFile = req.files['file'][0];
        const imageFile = req.files['image'] ? req.files['image'][0] : null;

        const { title, description, category, subject } = req.body;

        const template = new Template({
            title,
            description,
            category,
            subject: subject || '',
            fileUrl: `/uploads/${templateFile.filename}`,
            originalFileName: templateFile.originalname,
            previewImage: imageFile ? `/uploads/${imageFile.filename}` : undefined,
            uploadedBy: req.user._id,
        });

        const createdTemplate = await template.save();
        res.status(201).json(createdTemplate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Download a template (increments counter)
// @route   GET /api/templates/:id/download
const downloadTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        if (template) {
            // Increment download count
            template.downloads += 1;
            await template.save();

            // Send file
            const filePath = path.join(__dirname, '..', template.fileUrl);
            if (fs.existsSync(filePath)) {
                res.download(filePath, template.originalFileName || template.fileUrl.split('/').pop());
            } else {
                res.status(404).json({ message: 'File not found on server' });
            }
        } else {
            res.status(404).json({ message: 'Template not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Rate a template
// @route   POST /api/templates/:id/rate
const rateTemplate = async (req, res) => {
    try {
        const { rating } = req.body;
        const templateId = req.params.id;
        const userId = req.user._id;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Check if already rated
        const existingRating = await Rating.findOne({ user: userId, template: templateId });
        if (existingRating) {
            // Update existing rating
            existingRating.rating = rating;
            await existingRating.save();
        } else {
            // Create new rating
            await Rating.create({ user: userId, template: templateId, rating });
            template.ratingsCount += 1;
        }

        // Calculate average
        const allRatings = await Rating.find({ template: templateId });
        const avg = allRatings.reduce((acc, item) => item.rating + acc, 0) / allRatings.length;
        template.averageRating = avg;
        await template.save();

        res.json({ message: 'Rating saved', averageRating: avg });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a template (Admin or Owner)
// @route   DELETE /api/templates/:id
const deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Check if admin or owner
        if (template.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to delete this template' });
        }

        // Remove file from filesystem
        const filePath = path.join(__dirname, '..', template.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Template.findByIdAndDelete(req.params.id);
        // Also delete ratings
        await Rating.deleteMany({ template: req.params.id });

        res.json({ message: 'Template removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get templates uploaded by current user
// @route   GET /api/templates/my/templates
const getMyTemplates = async (req, res) => {
    try {
        const templates = await Template.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTemplates,
    getTemplateById,
    uploadTemplate,
    downloadTemplate,
    rateTemplate,
    deleteTemplate,
    getMyTemplates
};
