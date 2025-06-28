# 💰 Loopr - Financial Analytics Platform

A comprehensive financial analytics platform built with modern technologies for tracking, analyzing, and reporting financial transactions.

## 🚀 Features

### 📊 **Dashboard Analytics**
- Real-time financial metrics (Revenue, Expenses, Net Income)
- Interactive charts with revenue vs expenses trends
- Monthly growth calculations and performance indicators
- Comprehensive transaction overview

### 🔍 **Advanced Data Interaction**
- **Multi-field filtering**: Category, Status, Date ranges, Amount ranges, User ID
- **Real-time search** across all transaction fields with debouncing
- **Column-based sorting** with visual indicators
- **Smart pagination** with customizable page sizes (10, 25, 50, 100)

### 📤 **CSV Export System**
- **Column configuration**: Select which fields to export
- **Filter integration**: Export respects current filters and search
- **Auto-download**: Automatic file download with date-stamped filenames
- **Export preview**: Shows transaction count and column selection

### 🔐 **Authentication & Security**
- JWT-based authentication system
- Protected routes with automatic token management
- Secure login/signup with password validation
- Session management with automatic logout on token expiration

## 🏗️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Recharts** for data visualization
- **Axios** for API communication
- **Lucide React** for icons
- **CSS Modules** with custom design system

### **Backend**
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** enabled for cross-origin requests

## 📁 Project Structure

```
loopr/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard.tsx           # Main dashboard with analytics
│   │   │   ├── Login.tsx               # Authentication login
│   │   │   ├── Signup.tsx              # User registration
│   │   │   ├── LandingPage.tsx         # Marketing landing page
│   │   │   ├── TransactionFilters.tsx  # Advanced filtering component
│   │   │   ├── TransactionTable.tsx    # Sortable data table
│   │   │   ├── Pagination.tsx          # Pagination controls
│   │   │   └── CSVExport.tsx           # Export functionality
│   │   ├── services/        # API services
│   │   │   └── api.ts                  # HTTP client and API calls
│   │   ├── types/           # TypeScript type definitions
│   │   │   └── index.ts                # All interface definitions
│   │   └── styles/          # CSS and styling
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── models/          # MongoDB models
│   │   │   ├── User.ts                 # User schema
│   │   │   └── Transaction.ts          # Transaction schema
│   │   ├── config/          # Configuration files
│   │   │   └── database.ts             # MongoDB connection
│   │   ├── index.ts         # Express server setup
│   │   └── seed.ts          # Database seeding script
│   ├── transactions.json    # Sample data
│   └── package.json
├── package.json             # Root package.json for monorepo
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v18 or higher)
- npm (v8 or higher)
- MongoDB (local installation or MongoDB Atlas)

### **1. Clone & Install**
```bash
# Clone the repository
git clone <your-repo-url>
cd loopr

# Install dependencies for all packages
npm run install:all

# Or install concurrently for parallel development
npm install
```

### **2. Environment Setup**

Create a `.env` file in the `backend/` directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/financial-app
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

### **3. Database Setup**
```bash
# Start MongoDB (if running locally)
mongod

# Seed the database with sample data
cd backend
npm run seed
```

### **4. Development**

**Option A: Run everything at once (Recommended)**
```bash
# From root directory - runs both frontend and backend
npm run dev
```

**Option B: Run separately**
```bash
# Terminal 1 - Backend (http://localhost:3000)
npm run dev:backend

# Terminal 2 - Frontend (http://localhost:5173)
npm run dev:frontend
```

### **5. Access the Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Landing Page**: http://localhost:5173/
- **Login**: http://localhost:5173/login
- **Dashboard**: http://localhost:5173/dashboard (after login)

## 📖 Usage Guide

### **Getting Started**
1. **Sign Up**: Create a new account with email and password
2. **Login**: Access your dashboard with your credentials
3. **Explore**: View analytics, filter transactions, and export data

### **Dashboard Features**
- **Analytics Cards**: View total revenue, expenses, net income, and transaction counts
- **Interactive Charts**: Hover over chart points for detailed information
- **Filter Panel**: Use advanced filters to narrow down transaction data
- **Search**: Real-time search across all transaction fields
- **Export**: Configure and download CSV reports

### **API Endpoints**
```
POST   /signup           # User registration
POST   /login            # User authentication
GET    /profile          # Get user profile (protected)
GET    /transactions     # Get transactions with filters/pagination (protected)
GET    /analytics        # Get analytics data (protected)
```

## 🛠️ Available Scripts

### **Root Level Scripts**
```bash
npm run dev              # Start both frontend and backend in development
npm run start            # Start both in production mode
npm run build            # Build both frontend and backend
npm run test             # Run tests for both packages
npm run lint             # Lint both packages
npm run clean            # Clean node_modules and build files
npm run install:all      # Install dependencies for all packages
```

### **Frontend Scripts**
```bash
npm run dev:frontend     # Start frontend development server
npm run build:frontend   # Build frontend for production
npm run lint:frontend    # Lint frontend code
```

### **Backend Scripts**
```bash
npm run dev:backend      # Start backend in development mode
npm run start:backend    # Start backend in production mode
npm run build:backend    # Build backend TypeScript
npm run seed             # Seed database with sample data
```

## 🔧 Configuration

### **Frontend Configuration**
- **Vite Config**: `frontend/vite.config.ts`
- **TypeScript**: `frontend/tsconfig.json`
- **API Base URL**: `frontend/src/services/api.ts` (default: http://localhost:3000)

### **Backend Configuration**
- **Environment Variables**: `backend/.env`
- **TypeScript**: `backend/tsconfig.json`
- **Database**: `backend/src/config/database.ts`

## 🚀 Deployment

### **Frontend (Vercel/Netlify)**
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### **Backend (Heroku/Railway)**
```bash
cd backend
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### **Common Issues**

**Backend won't start:**
- Check if MongoDB is running
- Verify `.env` file configuration
- Ensure port 3000 is not in use

**Frontend build errors:**
- Clear node_modules: `npm run clean:frontend`
- Reinstall dependencies: `cd frontend && npm install`
- Check TypeScript errors: `npm run lint:frontend`

**Authentication issues:**
- Clear browser localStorage
- Check JWT_SECRET in backend .env
- Verify API base URL in frontend

### **Database Issues**
```bash
# Reset database
cd backend
npm run seed
```

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Search existing issues on GitHub
3. Create a new issue with detailed information

---

**Happy Coding! 🎉**