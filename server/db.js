const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// DNS resolution fix for MongoDB Atlas on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

let mongoServer = null;

const autoSeed = async () => {
  try {
    const Skill = require('./models/Skill');
    const User = require('./models/User');

    // Seed default skills if collection is empty
    const skillCount = await Skill.countDocuments();
    if (skillCount === 0) {
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
      await Skill.insertMany(seedSkills);
      console.log('🌱 Seeded initial platform skills');
    }

    // Seed default accounts
    const demoAccounts = [
      {
        email: 'admin@campusskill.com',
        name: 'Admin',
        password: 'admin123',
        role: 'admin',
        is_verified: true
      },
      {
        email: 'student@demo.com',
        name: 'Demo Student',
        password: 'demo123',
        role: 'student',
        college: 'Campus University',
        location: 'Mumbai, India',
        bio: 'Passionate student developer looking for freelance projects.'
      },
      {
        email: 'client@demo.com',
        name: 'Demo Client',
        password: 'demo123',
        role: 'client',
        location: 'Bangalore, India',
        bio: 'Looking to hire talented student freelancers.'
      }
    ];

    for (const acc of demoAccounts) {
      const exists = await User.findOne({ email: acc.email });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(acc.password, 10);
        await User.create({ ...acc, password: hashedPassword });
        console.log(`👤 Seeded demo account: ${acc.email} (${acc.role})`);
      }
    }
  } catch (err) {
    console.warn('Auto-seed note:', err.message);
  }
};

const connectDB = async () => {
  const envURI = process.env.MONGO_URI;
  const isPlaceholder = !envURI || envURI.includes('<YOUR_ACTUAL_PASSWORD>') || envURI.includes('<db_password>');

  // Try Atlas if user configured a non-placeholder URI
  if (!isPlaceholder) {
    try {
      console.log('Connecting to configured MongoDB Atlas cluster...');
      const conn = await mongoose.connect(envURI, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ MongoDB Connected to Atlas: ${conn.connection.host}`);
      await autoSeed();
      return;
    } catch (err) {
      console.warn(`⚠️ Atlas connection failed (${err.message}). Switching to persistent offline database...`);
    }
  } else {
    console.log('⚡ Atlas password placeholder detected. Running in persistent offline database mode...');
  }

  // Fallback: Persistent embedded MongoDB
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const dataDir = path.join(__dirname, '.mongodb_data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbPath: dataDir,
        storageEngine: 'wiredTiger'
      }
    });

    const localUri = mongoServer.getUri() + 'campusskill';
    await mongoose.connect(localUri);
    console.log(`🚀 Persistent Offline MongoDB Active at: ${localUri}`);
    await autoSeed();
  } catch (err) {
    console.error('❌ Failed to initialize local database:', err.message);
    process.exit(1);
  }
};

// Cleanup on shutdown
process.on('SIGINT', async () => {
  if (mongoServer) await mongoServer.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (mongoServer) await mongoServer.stop();
  process.exit(0);
});

module.exports = connectDB;
