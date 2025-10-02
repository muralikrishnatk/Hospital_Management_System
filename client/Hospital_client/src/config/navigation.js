// src/config/navigation.js
export const getNavigationItems = (role) => {
  const commonItems = [
    { 
      text: 'Dashboard', 
      path: `/${role}/dashboard`, 
      icon: 'dashboard',
      exact: true
    },
    { 
      text: 'Profile', 
      path: '/profile', 
      icon: 'person' 
    }
  ];

  const roleBasedItems = {
    admin: [
      {
        text: 'User Management',
        icon: 'people',
        children: [
          { text: 'All Users', path: '/admin/users' },
          { text: 'Doctors', path: '/admin/doctors' },
          { text: 'Patients', path: '/admin/patients' },
          { text: 'Staff', path: '/admin/staff' },
          { text: 'Add New User', path: '/admin/users/add' }
        ]
      },
      {
        text: 'Appointments',
        icon: 'calendar_today',
        children: [
          { text: 'All Appointments', path: '/admin/appointments' },
          { text: 'Schedule Appointment', path: '/admin/appointments/schedule' },
          { text: 'Appointment Calendar', path: '/admin/calendar' }
        ]
      },
      {
        text: 'Medical Records',
        icon: 'medical_services',
        path: '/admin/medical-records'
      },
      {
        text: 'Hospital Management',
        icon: 'apartment',
        children: [
          { text: 'Departments', path: '/admin/departments' },
          { text: 'Wards & Beds', path: '/admin/wards' },
          { text: 'Inventory', path: '/admin/inventory' },
          { text: 'Staff Management', path: '/admin/staff' }
        ]
      },
      {
        text: 'Billing & Finance',
        icon: 'payments',
        children: [
          { text: 'All Bills', path: '/admin/billing' },
          { text: 'Create Bill', path: '/admin/billing/create' },
          { text: 'Payment Records', path: '/admin/payments' },
          { text: 'Financial Reports', path: '/admin/reports/financial' }
        ]
      },
      {
        text: 'Reports & Analytics',
        icon: 'analytics',
        children: [
          { text: 'Patient Statistics', path: '/admin/reports/patients' },
          { text: 'Doctor Performance', path: '/admin/reports/doctors' },
          { text: 'Revenue Reports', path: '/admin/reports/revenue' },
          { text: 'Hospital Analytics', path: '/admin/analytics' }
        ]
      },
      {
        text: 'Settings',
        icon: 'settings',
        path: '/admin/settings'
      }
    ],

    doctor: [
      {
        text: 'My Schedule',
        icon: 'schedule',
        children: [
          { text: 'Today\'s Appointments', path: '/doctor/appointments/today' },
          { text: 'Upcoming Appointments', path: '/doctor/appointments/upcoming' },
          { text: 'My Calendar', path: '/doctor/calendar' },
          { text: 'Set Availability', path: '/doctor/availability' }
        ]
      },
      {
        text: 'My Patients',
        icon: 'personal_injury',
        children: [
          { text: 'Current Patients', path: '/doctor/patients' },
          { text: 'Patient History', path: '/doctor/patients/history' }
        ]
      },
      {
        text: 'Medical Records',
        icon: 'folder',
        children: [
          { text: 'Create Record', path: '/doctor/records/create' },
          { text: 'View Records', path: '/doctor/records' },
          { text: 'Lab Results', path: '/doctor/records/lab' }
        ]
      },
      {
        text: 'Prescriptions',
        icon: 'medication',
        children: [
          { text: 'Write Prescription', path: '/doctor/prescriptions/create' },
          { text: 'Prescription History', path: '/doctor/prescriptions' }
        ]
      },
      {
        text: 'Consultations',
        icon: 'medical_services',
        path: '/doctor/consultations'
      }
    ],

    patient: [
      {
        text: 'Appointments',
        icon: 'calendar_today',
        children: [
          { text: 'Book Appointment', path: '/patient/appointments/book' },
          { text: 'My Appointments', path: '/patient/appointments' },
          { text: 'Appointment History', path: '/patient/appointments/history' }
        ]
      },
      {
        text: 'Medical Records',
        icon: 'folder',
        children: [
          { text: 'Health Summary', path: '/patient/records/summary' },
          { text: 'Lab Reports', path: '/patient/records/lab' },
          { text: 'Prescriptions', path: '/patient/records/prescriptions' },
          { text: 'Medical History', path: '/patient/records/history' }
        ]
      },
      {
        text: 'Billing',
        icon: 'receipt',
        children: [
          { text: 'Current Bills', path: '/patient/bills/current' },
          { text: 'Payment History', path: '/patient/bills/history' },
          { text: 'Make Payment', path: '/patient/bills/pay' },
          { text: 'Insurance', path: '/patient/insurance' }
        ]
      },
      {
        text: 'Doctors',
        icon: 'medical_services',
        path: '/patient/doctors'
      }
    ],

    pharmacist: [
      {
        text: 'Prescriptions',
        icon: 'medication',
        children: [
          { text: 'Pending Dispensing', path: '/pharmacist/prescriptions/pending' },
          { text: 'Dispensing History', path: '/pharmacist/prescriptions/history' },
          { text: 'Verify Prescription', path: '/pharmacist/prescriptions/verify' }
        ]
      },
      {
        text: 'Inventory',
        icon: 'inventory',
        children: [
          { text: 'Medicine Stock', path: '/pharmacist/inventory/medicines' },
          { text: 'Low Stock Alert', path: '/pharmacist/inventory/alerts' },
          { text: 'Add Stock', path: '/pharmacist/inventory/add' },
          { text: 'Suppliers', path: '/pharmacist/inventory/suppliers' }
        ]
      },
      {
        text: 'Billing',
        icon: 'receipt',
        children: [
          { text: 'Pharmacy Sales', path: '/pharmacist/billing/sales' },
          { text: 'Create Pharmacy Bill', path: '/pharmacist/billing/create' }
        ]
      }
    ],

    receptionist: [
      {
        text: 'Appointments',
        icon: 'calendar_today',
        children: [
          { text: 'Schedule Appointment', path: '/receptionist/appointments/schedule' },
          { text: 'Today\'s Appointments', path: '/receptionist/appointments/today' },
          { text: 'Appointment Calendar', path: '/receptionist/appointments/calendar' },
          { text: 'Walk-in Patients', path: '/receptionist/appointments/walkin' }
        ]
      },
      {
        text: 'Patient Management',
        icon: 'people',
        children: [
          { text: 'Register Patient', path: '/receptionist/patients/register' },
          { text: 'Patient Directory', path: '/receptionist/patients' },
          { text: 'Admit Patient', path: '/receptionist/patients/admit' }
        ]
      },
      {
        text: 'Billing',
        icon: 'payments',
        children: [
          { text: 'Create Bill', path: '/receptionist/billing/create' },
          { text: 'Pending Payments', path: '/receptionist/billing/pending' },
          { text: 'Payment Collection', path: '/receptionist/billing/collect' }
        ]
      },
      {
        text: 'Reports',
        icon: 'description',
        path: '/receptionist/reports'
      }
    ]
  };

  return [...commonItems, ...(roleBasedItems[role] || [])];
};

export const getQuickActions = (role) => {
  const quickActions = {
    admin: [
      { label: 'Add New User', icon: 'person_add', path: '/admin/users/add' },
      { label: 'Schedule Appointment', icon: 'add_circle', path: '/admin/appointments/schedule' },
      { label: 'View Reports', icon: 'assessment', path: '/admin/reports/financial' },
      { label: 'Manage Inventory', icon: 'inventory', path: '/admin/inventory' }
    ],
    doctor: [
      { label: 'Today\'s Schedule', icon: 'today', path: '/doctor/appointments/today' },
      { label: 'Write Prescription', icon: 'medication', path: '/doctor/prescriptions/new' },
      { label: 'View Patients', icon: 'groups', path: '/doctor/patients' },
      { label: 'Medical Records', icon: 'folder', path: '/doctor/records' }
    ],
    patient: [
      { label: 'Book Appointment', icon: 'book_online', path: '/patient/appointments/book' },
      { label: 'View Records', icon: 'folder_open', path: '/patient/records/summary' },
      { label: 'Pay Bills', icon: 'payments', path: '/patient/bills/current' },
      { label: 'Find Doctors', icon: 'search', path: '/patient/doctors' }
    ],
    pharmacist: [
      { label: 'Pending Prescriptions', icon: 'pending_actions', path: '/pharmacist/prescriptions/pending' },
      { label: 'Check Stock', icon: 'inventory_2', path: '/pharmacist/inventory/medicines' },
      { label: 'Dispense Medicine', icon: 'medication', path: '/pharmacist/prescriptions/dispense' },
      { label: 'Low Stock Alert', icon: 'warning', path: '/pharmacist/inventory/alerts' }
    ],
    receptionist: [
      { label: 'Schedule Appointment', icon: 'add_circle', path: '/receptionist/appointments/schedule' },
      { label: 'Register Patient', icon: 'person_add', path: '/receptionist/patients/register' },
      { label: 'Collect Payment', icon: 'payments', path: '/receptionist/billing/collect' },
      { label: 'Today\'s Schedule', icon: 'today', path: '/receptionist/appointments/today' }
    ]
  };

  return quickActions[role] || [];
};