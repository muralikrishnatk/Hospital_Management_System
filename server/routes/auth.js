const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { auth } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      specialization: user.specialization
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      role,
      bloodGroup,
      address,
      specialization,
      qualification,
      licenseNumber,
      experience,
      consultationFee,
      pharmacyLicense
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !phone || !dateOfBirth) {
      return next(new AppError('Please provide all required fields', 400));
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      where: { email }
    });
    
    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    // Validate role-specific fields
    if (role === 'doctor') {
      if (!specialization || !licenseNumber) {
        return next(new AppError('Doctors must provide specialization and license number', 400));
      }
    }

    if (role === 'pharmacist' && !pharmacyLicense) {
      return next(new AppError('Pharmacists require pharmacy license number', 400));
    }

    // Create user object
    const userData = {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      role: role || 'patient',
      bloodGroup,
      address,
      ...(role === 'doctor' && { 
        specialization, 
        qualification, 
        licenseNumber,
        experience: experience || 0,
        consultationFee: consultationFee || 0
      }),
      ...(role === 'pharmacist' && {
        pharmacyLicense
      })
    };

    const user = await User.create(userData);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(new AppError('User with this email or license number already exists', 400));
    }
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Check for user with password
    const user = await User.findOne({ 
      where: { email },
      attributes: { include: ['password'] }
    });
    
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('Account is deactivated. Please contact administrator.', 401));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
router.put('/updatedetails', auth, async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      email: req.body.email
    };

    const user = await User.findByPk(req.user.id);
    await user.update(fieldsToUpdate);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;