# VERA Backend API

A Node.js Express server with MongoDB integration for the VERA application.

## Features

- Express.js server with security middleware
- MongoDB integration with Mongoose
- User management system
- Tag management system
- CORS configuration
- Rate limiting
- Environment-based configuration
- Error handling
- Request logging

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - Set your MongoDB connection string
   - Configure other environment variables as needed

## Configuration

### Environment Variables

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)
- `MONGODB_URI`: MongoDB connection string
- `CORS_ORIGIN`: Allowed CORS origin
- `JWT_SECRET`: JWT secret key (for future authentication)

### MongoDB Setup

#### Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Set `MONGODB_URI=mongodb://localhost:27017/vera` in `.env`

#### MongoDB Atlas (Cloud)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Set `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vera?retryWrites=true&w=majority` in `.env`

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## API Endpoints

### Health Check

- `GET /health` - Server health status

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Tags

- `GET /api/tags` - Get all tags
- `GET /api/tags/:id` - Get tag by ID
- `POST /api/tags` - Create new tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/              # Custom middleware
├── tags/
│   ├── model.js            # Tag Mongoose model
│   ├── controller.js       # Tag controllers
│   └── routes.js           # Tag routes
├── user/
│   ├── model.js            # User Mongoose model
│   ├── controller.js       # User controllers
│   └── routes.js           # User routes
├── server.js               # Main server file
├── package.json            # Dependencies and scripts
├── .env.example            # Environment variables template
└── README.md               # This file
```

## Security Features

- Helmet.js for security headers
- Rate limiting to prevent abuse
- CORS configuration
- Input validation with Mongoose
- Error handling middleware

## Development

The server includes:

- Hot reloading with nodemon in development
- Request logging with Morgan
- Comprehensive error handling
- Environment-based configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request
