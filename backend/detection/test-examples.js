/**
 * Test examples for the Detection API
 * These examples demonstrate how to use the detection endpoints
 */

// Example 1: File Upload Test
export const testFileUpload = async (filePath) => {
  const formData = new FormData();
  formData.append('file_data', filePath);

  try {
    const response = await fetch('http://localhost:5000/api/detect', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    console.log('File Upload Result:', result);
    return result;
  } catch (error) {
    console.error('File Upload Error:', error);
    throw error;
  }
};

// Example 2: Image URL Test
export const testImageUrl = async (imageUrl) => {
  try {
    const response = await fetch('http://localhost:5000/api/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: imageUrl
      })
    });

    const result = await response.json();
    console.log('Image URL Result:', result);
    return result;
  } catch (error) {
    console.error('Image URL Error:', error);
    throw error;
  }
};

// Example 3: Text Analysis Test
export const testTextAnalysis = async (text) => {
  try {
    const response = await fetch('http://localhost:5000/api/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text
      })
    });

    const result = await response.json();
    console.log('Text Analysis Result:', result);
    return result;
  } catch (error) {
    console.error('Text Analysis Error:', error);
    throw error;
  }
};

// Example 4: Health Check Test
export const testHealthCheck = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/detect/health');
    const result = await response.json();
    console.log('Health Check Result:', result);
    return result;
  } catch (error) {
    console.error('Health Check Error:', error);
    throw error;
  }
};

// Example 5: Get Supported Types Test
export const testSupportedTypes = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/detect/supported-types');
    const result = await response.json();
    console.log('Supported Types Result:', result);
    return result;
  } catch (error) {
    console.error('Supported Types Error:', error);
    throw error;
  }
};

// Example 6: Batch Testing
export const runBatchTests = async () => {
  console.log('Running Detection API Tests...\n');

  try {
    // Health check
    console.log('1. Testing Health Check...');
    await testHealthCheck();
    console.log('✅ Health check passed\n');

    // Supported types
    console.log('2. Testing Supported Types...');
    await testSupportedTypes();
    console.log('✅ Supported types retrieved\n');

    // Text analysis
    console.log('3. Testing Text Analysis...');
    await testTextAnalysis('This is a test text for deepfake detection analysis.');
    console.log('✅ Text analysis completed\n');

    // Image URL (using a sample image)
    console.log('4. Testing Image URL...');
    await testImageUrl('https://via.placeholder.com/300x300.jpg');
    console.log('✅ Image URL analysis completed\n');

    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Example usage in Node.js
if (import.meta.url === `file://${process.argv[1]}`) {
  runBatchTests();
}
