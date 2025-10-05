// Test script to check payment confirmation API
const testSessionId = 'cs_test_1234567890'; // Replace with a real test session ID

async function testPaymentConfirm() {
  try {
    console.log('🧪 Testing Payment Confirm API...');
    
    const response = await fetch('http://localhost:3000/api/payment/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: testSessionId,
        skipEmail: true
      }),
    });
    
    console.log('📡 Response Status:', response.status);
    const data = await response.json();
    console.log('📡 Response Data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPaymentConfirm();

