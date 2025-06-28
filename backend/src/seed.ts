import dotenv from 'dotenv';
import connectDB from './config/database';
import Transaction from './models/Transaction';
import User from './models/User';
import transactionsData from '../transactions.json';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Transaction.deleteMany({});
    await User.deleteMany({});

    // Create sample users
    console.log('👥 Creating sample users...');
    const sampleUsers = [
      { email: 'user001@example.com', password: 'password123' },
      { email: 'user002@example.com', password: 'password123' },
      { email: 'user003@example.com', password: 'password123' },
      { email: 'user004@example.com', password: 'password123' },
      { email: 'admin@loopr.com', password: 'admin123' }
    ];

    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Seed transactions
    console.log('💰 Seeding transactions...');
    
    // Transaction descriptions for revenue and expenses
    const revenueDescriptions = [
      'Website Development Project', 'Mobile App Development', 'Consulting Services', 'Software License Sale',
      'Design Services', 'Digital Marketing Campaign', 'E-commerce Platform', 'API Integration',
      'Data Analysis Project', 'Cloud Migration Service', 'SEO Optimization', 'Content Management System',
      'Custom Software Development', 'Technical Support Services', 'Database Optimization',
      'Security Audit', 'Performance Tuning', 'Training Services', 'Project Management',
      'UI/UX Design', 'Brand Identity Design', 'Social Media Marketing', 'Email Marketing Campaign'
    ];
    
    const expenseDescriptions = [
      'Office Rent Payment', 'Equipment Purchase', 'Software Subscription', 'Marketing Expenses',
      'Travel Expenses', 'Utility Bills', 'Internet Service', 'Phone Service',
      'Insurance Premium', 'Legal Fees', 'Accounting Services', 'Office Supplies',
      'Computer Hardware', 'Server Hosting', 'Domain Registration', 'SSL Certificate',
      'Professional Development', 'Conference Tickets', 'Training Materials', 'Software Tools',
      'Advertising Costs', 'Freelancer Payment', 'Contractor Fees'
    ];
    
    const userNames = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Lisa Wilson', 'Admin User'];
    
    // Convert transaction data to proper format, preserving user_profile URLs and adding user_name
    const formattedTransactions = transactionsData.map((transaction: any, index: number) => {
      const descriptions = transaction.category === 'Revenue' ? revenueDescriptions : expenseDescriptions;
      const description = descriptions[index % descriptions.length];
      const userName = userNames[index % userNames.length];
      
      return {
        ...transaction,
        description: transaction.description || description,
        user_profile: transaction.user_profile, // Keep the original image URL
        user_name: userName, // Add separate user name field
        date: new Date(transaction.date)
      };
    });

    await Transaction.insertMany(formattedTransactions);
    console.log(`✅ Seeded ${formattedTransactions.length} transactions`);

    // Generate summary statistics
    const totalRevenue = await Transaction.aggregate([
      { $match: { category: 'Revenue', status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpenses = await Transaction.aggregate([
      { $match: { category: 'Expense', status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingTransactions = await Transaction.countDocuments({ status: 'Pending' });

    console.log('\n📊 Database Summary:');
    console.log(`Total Paid Revenue: $${totalRevenue[0]?.total?.toLocaleString() || 0}`);
    console.log(`Total Paid Expenses: $${totalExpenses[0]?.total?.toLocaleString() || 0}`);
    console.log(`Pending Transactions: ${pendingTransactions}`);
    console.log(`Total Transactions: ${formattedTransactions.length}`);
    console.log(`Total Users: ${createdUsers.length}`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n👤 Sample user credentials:');
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email} | Password: ${user.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 