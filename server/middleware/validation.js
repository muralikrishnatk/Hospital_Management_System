import { body } from 'express-validator';

export const registerValidation = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('role')
    .isIn(['admin', 'doctor', 'receptionist', 'nurse', 'patient'])
    .withMessage('Please select a valid role'),
  
  body('phone')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('department')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Department name is too long'),

  // Patient-specific validations (conditional)
  body('dateOfBirth')
    .if(body('role').equals('patient'))
    .notEmpty()
    .withMessage('Date of birth is required for patients')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      console.log(age)
      if (age > 120) {
        throw new Error('Please provide a valid date of birth');
      }
      if (age < 0) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),

  body('gender')
    .if(body('role').equals('patient'))
    .notEmpty()
    .withMessage('Gender is required for patients')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Please select a valid gender'),

  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address is too long'),

  body('emergencyContact')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Emergency contact number must be between 10 and 15 characters')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid emergency contact number'),

  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please provide a valid blood group'),

  body('medicalHistory')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Medical history is too long'),

  body('allergies')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Allergies description is too long'),
    body('specialization')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Specialization is required for doctors')
    .isLength({ max: 100 })
    .withMessage('Specialization name is too long'),

  body('qualification')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Qualification is required for doctors')
    .isLength({ max: 100 })
    .withMessage('Qualification name is too long'),

  body('experience')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Experience is required for doctors')
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience must be between 0 and 50 years'),

  body('consultationFee')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Consultation fee is required for doctors')
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number'),

  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio is too long'),

  // Department required for staff roles
  body('department')
    .if(body('role').custom(value => ['doctor', 'nurse', 'receptionist'].includes(value)))
    .notEmpty()
    .withMessage('Department is required for staff roles')
    .isLength({ max: 100 })
    .withMessage('Department name is too long')  
];

export const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Additional validation for patient profile updates
export const updatePatientValidation = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Please select a valid gender'),
  
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address is too long'),
  
  body('emergencyContact')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Emergency contact number must be between 10 and 15 characters'),
  
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Please provide a valid blood group'),
  
  body('medicalHistory')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Medical history is too long'),
  
  body('allergies')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Allergies description is too long')
];