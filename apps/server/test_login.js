const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

async function testLogin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB.');
  
  const email = 'mehrajhossainmahir@gmail.com';
  const password = 'CollabBD2026!';
  
  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');
  
  const user = await usersCollection.findOne({ email });
  if (!user) {
    console.log('User not found.');
    mongoose.disconnect();
    return;
  }
  
  console.log('User found in raw collection:', user.email);
  console.log('Raw password hash:', user.password);
  
  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Password match:', isMatch);
  
  mongoose.disconnect();
}
testLogin().catch(console.error);
