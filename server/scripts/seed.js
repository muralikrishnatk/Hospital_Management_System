import { sequelize } from '../models/index.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@hms.com',
      password: 'Admin123',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      phone: '+1234567890',
      department: 'Administration'
    });

    // Create sample doctor
    const doctorUser = await User.create({
      username: 'doctor',
      email: 'doctor@hms.com',
      password: 'Doctor123',
      firstName: 'John',
      lastName: 'Smith',
      role: 'doctor',
      phone: '+1234567891',
      department: 'Cardiology'
    });

    // Create sample receptionist
    const receptionistUser = await User.create({
      username: 'reception',
      email: 'reception@hms.com',
      password: 'Reception123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'receptionist',
      phone: '+1234567892',
      department: 'Reception'
    });

    // Create sample patient user
    const patientUser = await User.create({
      username: 'patient',
      email: 'patient@hms.com',
      password: 'Patient123',
      firstName: 'Michael',
      lastName: 'Brown',
      role: 'patient',
      phone: '+1234567893',
      department: null
    });

    // Create doctor record
    await Doctor.create({
      firstName: 'John',
      lastName: 'Smith',
      email: 'doctor@hms.com',
      phone: '+1234567891',
      specialization: 'Cardiology',
      qualification: 'MD, Cardiology',
      experience: 10,
      consultationFee: 150.00,
      availability: true,
      userId: doctorUser.id
    });

    // Create patient record
    await Patient.create({
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'patient@hms.com',
      phone: '+1234567893',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'Male',
      address: '123 Main St, City, State',
      emergencyContact: '+1234567894',
      bloodGroup: 'O+',
      userId: patientUser.id
    });

    console.log('Sample data seeded successfully');
    console.log('Admin credentials: admin / Admin123');
    console.log('Doctor credentials: doctor / Doctor123');
    console.log('Receptionist credentials: reception / Reception123');
    console.log('Patient credentials: patient / Patient123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();