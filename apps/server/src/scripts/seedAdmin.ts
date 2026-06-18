import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collab-bd');
    console.log('MongoDB Connected');

    const adminEmail = 'admin@collab.bd';
    const adminPassword = await bcrypt.hash('admin123', 12);

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const adminUser = new User({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      accountType: 'client',
      verificationStatus: 'verified',
      isEmailVerified: true,
      badges: ['verified', 'expert'],
      skills: ['Administration', 'Moderation'],
      location: {
        type: 'Point',
        coordinates: [90.4125, 23.8103],
        address: 'Dhaka',
        city: 'Dhaka',
        district: 'Dhaka',
      },
    });

    await adminUser.save();
    console.log('Admin user seeded successfully!');
    console.log('Email: admin@collab.bd');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
