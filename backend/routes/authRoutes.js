const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    getUsers,
    forgotPassword,
    resetPassword,
    googleSignIn,
    appleSignIn
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/google', googleSignIn);
router.post('/apple', appleSignIn);

router.get('/profile', protect, getUserProfile);
router.get('/users', protect, admin, getUsers);

module.exports = router;
