require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Employee = require('./models/Employee');
const User = require('./models/User');
const Department = require('./models/Department');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Employee.deleteMany({});
    await User.deleteMany({});
    await Department.deleteMany({});

    console.log('Cleared existing data...');

    // Create departments
    const departments = await Department.insertMany([
      { name: 'Engineering', description: 'Software development team' },
      { name: 'Human Resources', description: 'HR and recruitment' },
      { name: 'Product', description: 'Product management' },
      { name: 'Sales', description: 'Sales team' },
      { name: 'Marketing', description: 'Marketing and communications' }
    ]);
    console.log('Created departments...');

    // Create employees
    const employees = await Employee.insertMany([
      {
        name: 'John Doe',
        email: 'john.doe@workforcehub.com',
        position: 'Software Engineer',
        department: 'Engineering',
        salary: 75000,
        hireDate: '2023-01-15'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@workforcehub.com',
        position: 'HR Manager',
        department: 'Human Resources',
        salary: 65000,
        hireDate: '2022-06-10'
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@workforcehub.com',
        position: 'Product Manager',
        department: 'Product',
        salary: 80000,
        hireDate: '2023-03-01'
      },
      {
        name: 'Alice Brown',
        email: 'alice.brown@workforcehub.com',
        position: 'Sales Representative',
        department: 'Sales',
        salary: 55000,
        hireDate: '2023-05-15'
      },
      {
        name: 'Charlie Wilson',
        email: 'charlie.wilson@workforcehub.com',
        position: 'Marketing Specialist',
        department: 'Marketing',
        salary: 50000,
        hireDate: '2023-07-01'
      }
    ]);
    console.log('Created employees...');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin123', salt);
    const managerHash = await bcrypt.hash('manager123', salt);
    const employeeHash = await bcrypt.hash('employee123', salt);

    // Create users
    await User.insertMany([
      {
        username: 'admin',
        email: 'admin@workforcehub.com',
        role: 'admin',
        passwordHash: adminHash
      },
      {
        username: 'manager',
        email: 'manager@workforcehub.com',
        role: 'manager',
        passwordHash: managerHash
      },
      {
        username: 'john.doe',
        email: 'john.doe@workforcehub.com',
        role: 'employee',
        passwordHash: employeeHash
      },
      {
        username: 'jane.smith',
        email: 'jane.smith@workforcehub.com',
        role: 'manager',
        passwordHash: managerHash
      },
      {
        username: 'bob.johnson',
        email: 'bob.johnson@workforcehub.com',
        role: 'manager',
        passwordHash: managerHash
      }
    ]);
    console.log('Created users...');

    console.log('\n✅ Seed completed successfully!');
    console.log('\nDefault Login Credentials:');
    console.log('  Admin: admin / admin123');
    console.log('  Manager: manager / manager123');
    console.log('  Employee: john.doe / employee123');
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
