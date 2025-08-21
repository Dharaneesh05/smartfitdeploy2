const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...');
  
  const testUser = {
    username: 'testuser123',
    email: 'test123@example.com',
    password: 'testpassword123',
    fullName: 'Test User'
  };
  
  try {
    // 1. Test Signup
    console.log('1. Testing signup...');
    const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, testUser);
    console.log('✅ Signup successful:', signupResponse.data);
    
    // 2. Test Login with same credentials
    console.log('2. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data);
    
    // 3. Test /me endpoint
    console.log('3. Testing /me endpoint...');
    const meResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    console.log('✅ /me endpoint successful:', meResponse.data);
    
    console.log('🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAuthFlow();
