# Environment Setup Guide

## Required Environment Variables

The VERA backend requires the following environment variables to be set:

### 0. Database Configuration

```env
MONGODB_URI=mongodb://localhost:27017/vera
```

**For MongoDB Atlas (cloud):**

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vera?retryWrites=true&w=majority
```

**How to get MongoDB URI:**

1. **Local MongoDB:** Use `mongodb://localhost:27017/vera` (default local setup)
2. **MongoDB Atlas:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account and cluster
   - Get your connection string from the "Connect" button
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., "vera")

The detection API also requires the following environment variables:

### 1. OpenAI Configuration

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**How to get OpenAI API Key:**

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new secret key
5. Copy the key and add it to your `.env` file

### 2. Cloudinary Configuration

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**How to get Cloudinary credentials:**

1. Go to [Cloudinary Console](https://console.cloudinary.com/)
2. Sign in or create an account
3. Go to Dashboard
4. Copy the Cloud Name, API Key, and API Secret
5. Add them to your `.env` file

## Environment File Setup

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/vera

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Other configurations
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

## Testing Configuration

### Method 1: Health Check Endpoint

```bash
curl http://localhost:5000/api/detect/health
```

### Method 2: Test Cloudinary Connection

```bash
# Test Cloudinary connection
curl http://localhost:5000/api/detect/test-connection
```

### Method 3: Test Upload

```bash
# Test Cloudinary upload
curl -X POST http://localhost:5000/api/detect/test-upload \
  -F "file_data=@test-image.jpg"
```

### Method 4: Manual Test

```bash
# Test file upload
curl -X POST http://localhost:5000/api/detect \
  -F "file_data=@test-image.jpg"

# Test image URL
curl -X POST http://localhost:5000/api/detect \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://via.placeholder.com/300x300.jpg"}'

# Test text analysis
curl -X POST http://localhost:5000/api/detect \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a test text for analysis"}'
```

## Troubleshooting

### Common Issues

1. **"Database connection error: The 'uri' parameter to 'openUri()' must be a string, got 'undefined'"**

   - This error occurs when `MONGODB_URI` is not set in your environment variables
   - Ensure `MONGODB_URI` is set in your `.env` file
   - Restart the server after adding the environment variable
   - Check that the `.env` file is in the correct location (`backend/.env`)
   - Verify the MongoDB URI format is correct (starts with `mongodb://` or `mongodb+srv://`)

2. **"Missing credentials" Error**

   - Ensure `OPENAI_API_KEY` is set in your `.env` file
   - Restart the server after adding environment variables
   - Check that the `.env` file is in the correct location (`backend/.env`)

3. **"Must supply api_key" Error**

   - This error occurs when Cloudinary can't read the environment variables
   - Ensure all three Cloudinary environment variables are set
   - Restart the server after adding environment variables
   - Check that the `.env` file is in the correct location (`backend/.env`)

4. **"Cloudinary configuration missing" Error**

   - Ensure all three Cloudinary environment variables are set
   - Verify the credentials are correct
   - Check that there are no extra spaces or quotes in the values

5. **"Module not found" Error**

   - Run `npm install` to install dependencies
   - Check that you're in the correct directory (`backend/`)

6. **"Request Timeout" Error**

   - The file may be too large (try uploading a smaller file)
   - Network connection may be slow (check your internet connection)
   - Cloudinary service may be experiencing issues
   - Try the connection test first: `curl http://localhost:5000/api/detect/test-connection`

7. **"Port already in use" Error**
   - Change the `PORT` in your `.env` file
   - Or kill the process using the port: `lsof -ti:5000 | xargs kill -9`

### Verification Steps

1. **Check Environment Variables**

   ```bash
   # In backend directory
   node -e "console.log(process.env.MONGODB_URI ? 'MongoDB: ✅' : 'MongoDB: ❌')"
   node -e "console.log(process.env.OPENAI_API_KEY ? 'OpenAI: ✅' : 'OpenAI: ❌')"
   node -e "console.log(process.env.CLOUDINARY_CLOUD_NAME ? 'Cloudinary: ✅' : 'Cloudinary: ❌')"
   ```

2. **Test Individual Components**

   ```bash
   # Test OpenAI configuration
   node -e "import('./detection/utils/aiUtils.js').then(m => console.log('OpenAI configured:', m.isOpenAIConfigured()))"
   ```

3. **Check Server Logs**
   - Look for any error messages during startup
   - Check that all modules are loading correctly
   - Verify that routes are registered properly

## Security Notes

- **Never commit `.env` files** to version control
- **Use strong, unique API keys**
- **Rotate API keys regularly**
- **Monitor API usage** to prevent unexpected charges
- **Use environment-specific configurations** for different deployments

## Production Deployment

For production deployment, set environment variables through your hosting platform:

### Heroku

```bash
heroku config:set MONGODB_URI=your-mongodb-connection-string
heroku config:set OPENAI_API_KEY=your-key
heroku config:set CLOUDINARY_CLOUD_NAME=your-cloud-name
heroku config:set CLOUDINARY_API_KEY=your-api-key
heroku config:set CLOUDINARY_API_SECRET=your-api-secret
```

### Docker

```dockerfile
ENV MONGODB_URI=your-mongodb-connection-string
ENV OPENAI_API_KEY=your-key
ENV CLOUDINARY_CLOUD_NAME=your-cloud-name
ENV CLOUDINARY_API_KEY=your-api-key
ENV CLOUDINARY_API_SECRET=your-api-secret
```

### Vercel/Netlify

Set environment variables in your platform's dashboard under Settings > Environment Variables.
