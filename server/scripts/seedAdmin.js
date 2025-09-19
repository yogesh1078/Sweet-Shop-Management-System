const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load env from server/.env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const { connectDB } = require('../src/config/database');
const User = require('../src/models/User');

async function run() {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ username, email, password, role: 'admin' });
      await user.save();
      console.log('✅ Admin user created:', { email, username });
    } else {
      if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        console.log('✅ Existing user promoted to admin:', { email });
      } else {
        console.log('ℹ️ Admin already exists:', { email });
      }
    }
  } catch (err) {
    console.error('❌ Seed admin failed:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();




