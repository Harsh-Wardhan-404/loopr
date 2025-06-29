import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import User, { IUser } from './models/User';
import Transaction from './models/Transaction';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://loopr-frontend-theta.vercel.app/',
  'https://loopr.harshwardhan.tech',
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

// JWT Middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  console.log("authHeader", authHeader);
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate JWT token
const generateToken = (user: { id: string; email: string }): string => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
};

// Routes

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'JWT Auth API with MongoDB is running!',
    database: 'MongoDB',
    endpoints: {
      auth: ['POST /signup', 'POST /login'],
      protected: ['GET /profile', 'GET /transactions', 'GET /analytics']
    }
  });
});

// Signup route
app.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Create new user (password will be hashed automatically by the model)
    const newUser = new User({ email, password });
    await newUser.save();

    // Generate token
    const token = generateToken({ id: (newUser._id as string).toString(), email: newUser.email });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);

    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
app.post('/login', async (req: Request, res: Response) => {
  try {
    console.log("login route");
    console.log(req.body);
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password using the model method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({ id: (user._id as string).toString(), email: user.email });
    console.log("Login successful, should redirect");
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route - User profile
app.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route - Get transactions for charts
app.get('/transactions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, category, status, user_id, search, sortBy, sortOrder } = req.query;

    // Build filter object
    const filter: any = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (user_id) filter.user_id = user_id;

    // Add search functionality
    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive search
      const amountSearch = parseFloat(search.replace(/[$,]/g, '')); // Parse potential amount search

      filter.$or = [
        { description: searchRegex },
        { user_name: searchRegex },
        { user_id: searchRegex },
        // Search by amount if the search term is a number
        ...((!isNaN(amountSearch) && amountSearch > 0) ? [{ amount: amountSearch }] : [])
      ];
    }

    // Build sort object
    let sortObject: any = { date: -1 }; // Default sort by date descending

    if (sortBy && typeof sortBy === 'string') {
      const direction = sortOrder === 'asc' ? 1 : -1;

      // Map frontend field names to backend field names if needed
      const fieldMap: { [key: string]: string } = {
        'description': 'description',
        'date': 'date',
        'amount': 'amount',
        'status': 'status',
        'user_name': 'user_name',
        'category': 'category'
      };

      const dbField = fieldMap[sortBy] || sortBy;
      sortObject = { [dbField]: direction };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get transactions
    const transactions = await Transaction.find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: total,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        totalTransactions: total,
        hasNext: skip + transactions.length < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route - Analytics data for charts
app.get('/analytics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Revenue vs Expenses summary
    const revenueVsExpenses = await Transaction.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          paid: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Paid'] }, '$amount', 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Pending'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    // Monthly trends
    const monthlyTrends = await Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            category: '$category'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Status distribution
    const statusDistribution = await Transaction.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Top users by transaction volume
    const topUsers = await Transaction.aggregate([
      {
        $group: {
          _id: '$user_id',
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Revenue'] }, '$amount', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$category', 'Expense'] }, '$amount', 0]
            }
          }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      summary: {
        revenueVsExpenses,
        statusDistribution,
        totalTransactions: await Transaction.countDocuments(),
        totalUsers: await Transaction.distinct('user_id').then((users: string[]) => users.length)
      },
      trends: {
        monthly: monthlyTrends
      },
      topUsers
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/`);
  console.log(`🔐 Auth endpoints:`);
  console.log(`   POST http://localhost:${PORT}/signup`);
  console.log(`   POST http://localhost:${PORT}/login`);
  console.log(`📊 Protected endpoints:`);
  console.log(`   GET http://localhost:${PORT}/profile`);
  console.log(`   GET http://localhost:${PORT}/transactions`);
  console.log(`   GET http://localhost:${PORT}/analytics`);
  console.log(`\n💡 To seed the database, run: npm run seed`);
});
