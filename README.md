# TemplateHub — Template Sharing Platform

A full-stack web platform for sharing, discovering, and downloading free design templates.

## 🚀 Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcrypt

## ✨ Features

- Browse & search 1000+ templates
- Upload templates with preview images
- User authentication (Sign Up / Login / Forgot Password)
- Star ratings & download tracking
- Dark mode toggle
- Mobile responsive with hamburger menu
- Admin dashboard
- Cookie consent & Privacy Policy

## 📦 Quick Start (Local)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/templatehub.git
cd templatehub/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file in the `backend/` folder
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/template-sharing
JWT_SECRET=your_secret_key_here
```

### 4. Seed the database (optional — adds sample templates)
```bash
node seed.js
```

### 5. Start the server
```bash
npm run dev
```

### 6. Open in browser
```
http://localhost:5000
```

## 🔐 Default Admin Account
```
Email    : admin@templatehub.com
Password : Admin@1234
```

## 🌐 Deployment

This app is deployed on:
- **Backend + Frontend**: [Railway](https://railway.app)
- **Database**: [MongoDB Atlas](https://mongodb.com/atlas)

## 📁 Project Structure

```
TemplateSharingPlatform/
├── backend/
│   ├── controllers/       # Route logic
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Auth & upload middleware
│   ├── config/            # DB connection
│   ├── uploads/           # Uploaded files (local)
│   └── server.js          # Entry point
└── frontend/
    ├── css/               # Stylesheets
    ├── js/                # JavaScript files
    └── *.html             # All pages
```

## 📄 License

MIT License — Free to use and modify.
