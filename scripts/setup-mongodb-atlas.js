#!/usr/bin/env node

/**
 * Script to help set up MongoDB Atlas connection
 * This is just a helper script - actual configuration should be done via environment variables
 */

import { MongoClient } from 'mongodb';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 MongoDB Atlas Setup Helper');
console.log('=============================');

// Your provided MongoDB Atlas connection string
const providedUri = 'mongodb+srv://dharaneeshc23aid:<db_password>@smartfit.u09ehga.mongodb.net/?retryWrites=true&w=majority&appName=smartfit';

console.log('\n📋 Your MongoDB Atlas connection string template:');
console.log(providedUri);

console.log('\n💡 Instructions:');
console.log('1. Replace <db_password> with your actual MongoDB Atlas password');
console.log('2. Make sure your IP is whitelisted in MongoDB Atlas (0.0.0.0/0 for all IPs during testing)');
console.log('3. Set the MONGODB_URI environment variable with your complete connection string');

console.log('\n🌐 For Render deployment:');
console.log('1. Go to your Render service dashboard');
console.log('2. Add environment variable MONGODB_URI with your complete connection string');
console.log('3. Add JWT_SECRET with a strong random string');
console.log('4. Set PORT=5000 and NODE_ENV=production');

console.log('\n✅ Example complete connection string:');
console.log('mongodb+srv://dharaneeshc23aid:yourActualPassword@smartfit.u09ehga.mongodb.net/smartfit?retryWrites=true&w=majority&appName=smartfit');

// Test connection if user wants
rl.question('\n🧪 Would you like to test the connection? (y/N): ', async (answer) => {
  if (answer.toLowerCase() === 'y') {
    rl.question('Enter your complete MongoDB Atlas connection string: ', async (connectionString) => {
      try {
        console.log('Testing connection...');
        const client = new MongoClient(connectionString);
        await client.connect();
        console.log('✅ Connection successful!');
        const db = client.db();
        const collections = await db.listCollections().toArray();
        console.log(`📊 Found ${collections.length} collections`);
        await client.close();
      } catch (error) {
        console.error('❌ Connection failed:', error.message);
      } finally {
        rl.close();
      }
    });
  } else {
    rl.close();
  }
});

rl.on('close', () => {
  console.log('\n🎉 Setup helper completed!');
  console.log('Remember to set your environment variables for deployment.');
  process.exit(0);
});
