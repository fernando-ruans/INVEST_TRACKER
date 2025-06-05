const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User, EmailVerification, PasswordReset } = require('../models');
const { authenticateToken, generateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 30 }).trim(),
  body('full_name').isLength({ min: 2, max: 100 }).trim(),
  body('password').isLength({ min: 6 })
];

const loginValidation = [
  body('username').notEmpty().trim(),
  body('password').notEmpty()
];

// Register endpoint
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, username, full_name, password } = req.body;

    // Check if user already exists
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email já registrado'
      });
    }

    const existingUserByUsername = await User.findOne({ where: { username } });
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: 'Nome de usuário já registrado'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashed_password = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      email,
      username,
      full_name,
      hashed_password,
      is_active: true,
      is_verified: false
    });

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await EmailVerification.create({
      user_id: user.id,
      verification_code: verificationCode,
      expires_at: expiresAt
    });

    // Return user data (without password)
    const { hashed_password: _, ...userData } = user.toJSON();
    
    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: userData
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Login endpoint
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          { email: username }
        ]
      }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Nome de usuário ou senha incorretos'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.hashed_password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Nome de usuário ou senha incorretos'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        access_token: token,
        token_type: 'bearer'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { hashed_password: _, ...userData } = req.user.toJSON();
    
    // Convert relative avatar path to full URL if it exists
    if (userData.avatar && !userData.avatar.startsWith('http')) {
      userData.avatar = `${req.protocol}://${req.get('host')}${userData.avatar}`;
    }
    
    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('full_name').optional({ checkFalsy: true }).isLength({ min: 2, max: 100 }).trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('username').optional().isLength({ min: 3, max: 50 }).trim()
], async (req, res) => {
  try {
    console.log('Profile update request received');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    console.log('Request file:', req.file);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { full_name, email, username } = req.body;
    const updateData = {};

    if (full_name) updateData.full_name = full_name;
    if (username) {
      if (username !== req.user.username) {
        // Check if username is already taken
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Nome de usuário já está em uso'
          });
        }
      }
      updateData.username = username;
    }
    if (email && email !== req.user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
      updateData.email = email;
      updateData.is_verified = false; // Reset verification if email changes
    }

    await req.user.update(updateData);
    await req.user.reload();

    const { hashed_password: _, ...userData } = req.user.toJSON();
    
    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Upload avatar
router.post('/avatar', authenticateToken, (req, res, next) => {
  console.log('Avatar upload request received');
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
}, upload.single('avatar'), async (req, res) => {
  try {
    console.log('Upload avatar middleware processed');
    console.log('req.file:', req.file);
    
    if (!req.file) {
      console.log('No file received in request');
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }
    
    console.log('File uploaded successfully:', req.file.filename);
    console.log('File path:', req.file.path);
    console.log('File destination:', req.file.destination);
    console.log('File mimetype:', req.file.mimetype);

    // Delete old avatar if exists
    if (req.user.avatar) {
      const avatarUrl = req.user.avatar;
      const urlParts = avatarUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const oldAvatarPath = path.join(__dirname, '../../uploads/avatars/', filename);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user avatar path
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const avatarUrl = avatarPath;
    await req.user.update({ avatar: avatarUrl });
    await req.user.reload();

    const { hashed_password: _, ...userData } = req.user.toJSON();

    res.json({
      success: true,
      message: 'Avatar atualizado com sucesso',
      data: userData
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Remove avatar
router.delete('/avatar', authenticateToken, async (req, res) => {
  try {
    // Delete old avatar file if exists
    if (req.user.avatar) {
      // Extract the file path from the URL
      const avatarUrl = req.user.avatar;
      const urlParts = avatarUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const oldAvatarPath = path.join(__dirname, '../../uploads/avatars/', filename);
      
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user avatar to null
    await req.user.update({ avatar: null });
    await req.user.reload();

    const { hashed_password: _, ...userData } = req.user.toJSON();

    res.json({
      success: true,
      message: 'Avatar removido com sucesso',
      data: userData
    });
  } catch (error) {
    console.error('Remove avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Change password
router.put('/password', authenticateToken, [
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { current_password, new_password } = req.body;

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, req.user.hashed_password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashed_password = await bcrypt.hash(new_password, saltRounds);

    await req.user.update({ hashed_password });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;