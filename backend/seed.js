const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Template = require('./models/Template');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/template-sharing';

// Preview image mapping — these images now exist in /uploads/
const PREVIEW_IMAGES = {
    "Modern Pitch Deck": "/uploads/preview_pitch_deck.png",
    "Minimalist Resume": "/uploads/preview_resume.png",
    "Monthly Budget Tracker": "/uploads/preview_budget.png",
    "Marketing Strategy Plan": "/uploads/preview_marketing.png",
    "Web Developer Portfolio": "/uploads/preview_portfolio.png",
    "React Dashboard Admin": "/uploads/preview_code_dash.png",
    "Brand Guidelines": "/uploads/preview_brand.png",
    "Invoice Template": "/uploads/preview_invoice.png",
    "SaaS Landing Page": "/uploads/preview_saas.png",
    "Creative Agency Deck": "/uploads/preview_marketing.png",
    "E-Commerce Financial Model": "/uploads/preview_budget.png",
    "Python Data Analysis Script": "/uploads/preview_code_dash.png",
    "Company Newsletter": "/uploads/preview_saas.png",
    "Social Media Calendar": "/uploads/preview_brand.png",
};

// Sample data for templates
const TEMPLATES_DATA = [
    { title: "Modern Pitch Deck", desc: "A clean, modern presentation template for startup pitches. Includes slides for problem, solution, market size, traction, and team.", cat: "Presentations", sub: "Business", file: "pitch-deck.pdf" },
    { title: "Minimalist Resume", desc: "Stand out with this clean, minimalist resume template. Designed for software engineers and designers.", cat: "Documents", sub: "Career", file: "resume.docx" },
    { title: "Monthly Budget Tracker", desc: "Automated spreadsheet to track your monthly expenses, income, and savings goals with beautiful charts.", cat: "Spreadsheets", sub: "Finance", file: "budget.xlsx" },
    { title: "Marketing Strategy Plan", desc: "Comprehensive plan template for marketing campaigns with timelines, KPIs, and channel strategies.", cat: "Presentations", sub: "Marketing", file: "marketing.pptx" },
    { title: "Web Developer Portfolio", desc: "HTML/CSS/JS template for a sleek developer portfolio. Fully responsive with a dark theme.", cat: "Code", sub: "Web Dev", file: "portfolio.zip" },
    { title: "Project Proposal", desc: "Professional project proposal document with cost estimates, milestones, and deliverables.", cat: "Documents", sub: "Business", file: "proposal.pdf" },
    { title: "Social Media Calendar", desc: "Plan your posts easily across all platforms with this automated content calendar spreadsheet.", cat: "Spreadsheets", sub: "Marketing", file: "social-media.xlsx" },
    { title: "Invoice Template", desc: "Simple, highly readable invoice template for freelancers. Includes automated total calculation.", cat: "Documents", sub: "Finance", file: "invoice.pdf" },
    { title: "React Dashboard Admin", desc: "Starter code for a React-based admin dashboard with charts, tables, and authentication.", cat: "Code", sub: "Web Dev", file: "react-dash.zip" },
    { title: "Event Planning Checklist", desc: "Never forget a detail with this comprehensive event planning checklist for any occasion.", cat: "Documents", sub: "Events", file: "event-checklist.pdf" },
    { title: "E-Commerce Financial Model", desc: "Project revenue, expenses, and breakeven for an online store with dynamic input fields.", cat: "Spreadsheets", sub: "Business", file: "ecommerce-model.xlsx" },
    { title: "Employee Onboarding Guide", desc: "A great first-day guide for new hires. Covers company culture, tools, team structure, and policies.", cat: "Documents", sub: "HR", file: "onboarding.pdf" },
    { title: "Creative Agency Deck", desc: "Highly visual presentation for creative agencies with portfolio slides and case study layouts.", cat: "Presentations", sub: "Design", file: "agency-deck.pptx" },
    { title: "Python Data Analysis Script", desc: "Starter Jupyter notebook for pandas data analysis with common visualizations pre-built.", cat: "Code", sub: "Data Science", file: "analysis.zip" },
    { title: "Meeting Minutes Template", desc: "Keep track of action items, decisions, and attendees efficiently with this clean document.", cat: "Documents", sub: "Business", file: "meeting-minutes.pdf" },
    { title: "Fitness Tracking Log", desc: "Track workouts, body measurements and nutrition goals with automated progress charts.", cat: "Spreadsheets", sub: "Health", file: "fitness-log.xlsx" },
    { title: "Real Estate Brochure", desc: "Beautiful, print-ready layout for property listings with photo placeholders and description areas.", cat: "Documents", sub: "Real Estate", file: "brochure.pdf" },
    { title: "Restaurant Menu Design", desc: "Chalkboard-style menu template editable in Word and Google Docs for any restaurant.", cat: "Documents", sub: "Food", file: "menu.pdf" },
    { title: "Weekly Lesson Plan", desc: "Organized layout for teachers and educators. Includes learning objectives and activity blocks.", cat: "Documents", sub: "Education", file: "lesson-plan.pdf" },
    { title: "SaaS Landing Page", desc: "Tailwind CSS landing page template for a SaaS product. Fast, responsive, and conversion-optimized.", cat: "Code", sub: "Web Dev", file: "saas-landing.zip" },
    { title: "Company Newsletter", desc: "Responsive HTML email template for internal communications and marketing newsletters.", cat: "Code", sub: "Marketing", file: "newsletter.zip" },
    { title: "Inventory Management System", desc: "Excel sheet with smart formulas, low stock alerts, and supplier tracking for small businesses.", cat: "Spreadsheets", sub: "Business", file: "inventory.xlsx" },
    { title: "Brand Guidelines", desc: "Professional booklet to establish brand identity, color palette, typography, and logo usage.", cat: "Presentations", sub: "Design", file: "brand-guidelines.pdf" },
    { title: "Client Service Agreement", desc: "Standard contract template for freelancers with scope, payment terms, and confidentiality clauses.", cat: "Documents", sub: "Legal", file: "contract.pdf" }
];

async function seedDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected.');

        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

        // Find or create an admin user (WITH HASHED PASSWORD)
        let adminUser = await User.findOne({ email: 'admin@templatehub.com' });
        if (!adminUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPwd = await bcrypt.hash('Admin@1234', salt);
            adminUser = new User({
                name: 'TemplateHub Admin',
                email: 'admin@templatehub.com',
                password: hashedPwd,
                role: 'admin'
            });
            await adminUser.save();
            console.log('👤 Created Admin User (email: admin@templatehub.com, password: Admin@1234)');
        } else {
            console.log('👤 Admin User already exists');
        }

        let insertedCount = 0;
        let updatedCount = 0;

        for (const tmpl of TEMPLATES_DATA) {
            const preview = PREVIEW_IMAGES[tmpl.title] || null;
            const exists = await Template.findOne({ title: tmpl.title });

            if (!exists) {
                // Create dummy file
                const filePath = path.join(uploadsDir, tmpl.file);
                if (!fs.existsSync(filePath)) {
                    fs.writeFileSync(filePath, `Dummy content for ${tmpl.title} template.`);
                }

                const newTemplate = new Template({
                    title: tmpl.title,
                    description: tmpl.desc,
                    category: tmpl.cat,
                    subject: tmpl.sub,
                    fileUrl: `/uploads/${tmpl.file}`,
                    originalFileName: tmpl.file,
                    previewImage: preview,
                    uploadedBy: adminUser._id,
                    downloads: Math.floor(Math.random() * 600),
                    averageRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
                    ratingsCount: Math.floor(Math.random() * 80) + 5
                });

                await newTemplate.save();
                insertedCount++;
                console.log(`📄 Added: ${tmpl.title}${preview ? ' ✅ (with image)' : ''}`);
            } else if (!exists.previewImage && preview) {
                // Update existing template with a preview image
                await Template.findByIdAndUpdate(exists._id, { previewImage: preview });
                updatedCount++;
                console.log(`🖼  Updated image for: ${tmpl.title}`);
            }
        }

        console.log(`\n🎉 Done! Added ${insertedCount} new templates, updated ${updatedCount} with preview images.`);

    } catch (err) {
        console.error('❌ Error seeding database:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seedDatabase();
