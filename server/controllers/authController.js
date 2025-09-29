import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize'; // Import Sequelize operators
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      username, 
      email, 
      password, 
      firstName, 
      lastName, 
      role, 
      phone, 
      department,
      // Patient-specific fields
      dateOfBirth,
      gender,
      address,
      // Doctor-specific fields
      specialization,
      qualification,
      experience,
      consultationFee,
      bio
    } = req.body;

    // Check if user already exists - FIXED
    const existingUser = await User.findOne({
      where: { 
        [Op.or]: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Create user
    
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'patient',
      phone,
      department
    });

    // If role is patient, also create patient record
    if (role === 'patient') {
      await Patient.create({
       
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        address: address || null,
        userId: user.id
      });
    }

    // If role is doctor, also create doctor record
    if (role === 'doctor') {
      await Doctor.create({
        firstName,
        lastName,
        email,
        phone,
        specialization: department || 'General',
        qualification: 'MBBS',
        experience: 0,
        consultationFee: 0,
        userId: user.id
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

// login, getProfile, updateProfile, changePassword functions remain the same...
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const user = await User.findOne({ 
      where: { username },
      attributes: { include: ['password'] }
    });

    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.json({
      message: 'Profile retrieved successfully',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, department } = req.body;
    
    await req.user.update({ 
      firstName, 
      lastName, 
      email, 
      phone, 
      department 
    });

    res.json({ 
      message: 'Profile updated successfully', 
      user: req.user 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!(await req.user.validatePassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    await req.user.update({ password: newPassword });
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};