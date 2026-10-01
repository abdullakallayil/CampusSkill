const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
require('dotenv').config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const Skill = require('./models/Skill');
const User = require('./models/User');

const seedSkills = [
  { skill_name: 'Web Development', category: 'Tech' },
  { skill_name: 'Graphic Design', category: 'Design' },
  { skill_name: 'Video Editing', category: 'Media' },
  { skill_name: 'Content Writing', category: 'Writing' },
  { skill_name: 'Data Analysis', category: 'Tech' },
  { skill_name: 'Python', category: 'Tech' },
  { skill_name: 'JavaScript', category: 'Tech' },
  { skill_name: 'React.js', category: 'Tech' },
  { skill_name: 'UI/UX Design', category: 'Design' },
  { skill_name: 'Photography', category: 'Media' },
  { skill_name: 'Social Media Marketing', category: 'Marketing' },
  { skill_name: 'Tutoring', category: 'Education' },
  { skill_name: 'Mobile App Development', category: 'Tech' },
  { skill_name: 'Logo Design', category: 'Design' },
  { skill_name: 'Translation', category: 'Writing' },
  { skill_name: 'SEO', category: 'Marketing' },
  { skill_name: 'Excel & Spreadsheets', category: 'Tech' },
  { skill_name: 'Music Production', category: 'Media' }
];

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusskill';
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB at ${mongoURI}`);

    // Seed Skills
    for (const skillData of seedSkills) {
      await Skill.findOneAndReplace(
        { skill_name: skillData.skill_name },
        skillData,
        { upsert: true, new: true }
      );
    }
    console.log('Skills seeded successfully!');

    // Seed Admin
    const adminEmail = 'admin@campusskill.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const hashed = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: hashed,
        role: 'admin',
        is_verified: true
      });
      console.log('Admin user seeded successfully!');
    } else {
      console.log('Admin user already exists.');
    }

    console.log('Seeding completed. Exiting...');
    process.exit(0);
  } catch (err) {
    console.error(`Error during seeding: ${err.message}`);
    process.exit(1);
  }
};

seedDB();
