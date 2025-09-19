# 🍭 Sweet Shop Management System

A comprehensive full-stack web application for managing a sweet shop inventory, built with the MERN stack (MongoDB, Express.js, React, Node.js) using Test-Driven Development (TDD) principles.

## ✨ Features

### Backend API
- **Authentication System**: JWT-based user authentication with role-based access control
- **User Management**: Registration, login, and user profile management
- **Sweet Management**: Full CRUD operations for managing sweet inventory
- **Inventory Management**: Purchase and restock functionality with real-time stock updates
- **Search & Filtering**: Advanced search capabilities with category and price filtering
- **Analytics**: Comprehensive inventory analytics and reporting
- **Security**: Input validation, error handling, and secure password hashing

### Frontend Application
- **Modern UI**: Beautiful, responsive interface built with Material-UI
- **User Dashboard**: Overview of inventory with key metrics and statistics
- **Admin Panel**: Complete inventory management for administrators
- **Real-time Updates**: Live inventory tracking and stock management
- **Search & Filter**: Advanced search and filtering capabilities
- **Role-based Access**: Different interfaces for users and administrators

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Jest** - Testing framework

### Frontend
- **React** - Frontend framework
- **Material-UI** - UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sweet-shop-management
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/sweet-shop
DB_NAME=sweet_shop

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 5. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod

# Or if using MongoDB as a service
sudo systemctl start mongod
```

### 6. Run the Application

#### Development Mode (Both Backend and Frontend)
```bash
npm run dev
```

#### Backend Only
```bash
npm run server
```

#### Frontend Only
```bash
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Sweet Management Endpoints
- `GET /api/sweets` - Get all sweets (with pagination and filtering)
- `GET /api/sweets/search` - Search sweets
- `GET /api/sweets/:id` - Get single sweet
- `POST /api/sweets` - Create new sweet (Admin only)
- `PUT /api/sweets/:id` - Update sweet (Admin only)
- `DELETE /api/sweets/:id` - Delete sweet (Admin only)

### Inventory Management Endpoints
- `POST /api/inventory/sweets/:id/purchase` - Purchase sweet
- `POST /api/inventory/sweets/:id/restock` - Restock sweet (Admin only)
- `GET /api/inventory/stock` - Get low stock items (Admin only)
- `GET /api/inventory/analytics` - Get inventory analytics (Admin only)

## 🎯 User Roles

### Regular User
- View all available sweets
- Search and filter sweets
- Purchase sweets (if in stock)
- View personal dashboard

### Administrator
- All user permissions
- Add, edit, and delete sweets
- Manage inventory (restock items)
- View analytics and reports
- Access admin-only features

## 🏗️ Project Structure

```
sweet-shop-management/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── notFound.js
│   ├── models/
│   │   ├── User.js
│   │   └── Sweet.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── sweets.js
│   │   └── inventory.js
│   ├── test/
│   │   ├── auth.test.js
│   │   ├── sweets.test.js
│   │   └── setup.js
│   └── server.js
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── package.json
├── jest.config.js
└── README.md
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- Role-based access control

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or use a cloud MongoDB service
2. Update environment variables for production
3. Deploy to platforms like Heroku, Railway, or AWS

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to platforms like Netlify, Vercel, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎉 Acknowledgments

- Material-UI for the beautiful component library
- MongoDB for the flexible database solution
- Express.js for the robust backend framework
- React for the powerful frontend library

---

**Happy Coding! 🍭✨**




