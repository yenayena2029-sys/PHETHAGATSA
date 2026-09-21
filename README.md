# SnapShop E-Commerce Platform

Welcome to the SnapShop codebase! SnapShop is a robust, modern, web-based e-commerce platform built with Node.js. 

## 🚀 Features
- **User Authentication:** Secure login and registration.
- **Product Management:** Manage your product catalog.
- **Shopping Cart & Checkout:** Seamless shopping experience.
- **Admin Dashboard:** Centralized control panel for platform management.
- **High Performance:** Built with modern web technologies for optimal speed.

## 📋 Prerequisites
Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [MongoDB](https://www.mongodb.com/) (v7.0 or higher)

## 🛠️ Installation

1. **Install Dependencies**
   Navigate to the project root and run:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory by copying the included `.env.example` file and configure the necessary variables:
   ```env
   DEMO_MODE=false
   MONGODB_URI=mongodb://user:password@127.0.0.1:27017/snapshop?authSource=admin
   JWT_SECRET=your_super_secret_jwt_key
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```
   *Note: Make sure to replace the dummy values with your actual database credentials and secure keys.*

## 💻 Running Locally

To start the application in development mode:
```bash
npm run dev
```

To start the application in production mode:
```bash
npm start
```

The application will be accessible at `http://localhost:3000` (or your configured `NEXT_PUBLIC_API_URL`).

## 📚 Documentation
For detailed deployment instructions, including how to host SnapShop on cPanel/Gadohost or a Linux VPS, please refer to the `Documentation` folder located in the parent directory.

## 📄 License
This project is proprietary. All rights reserved.
