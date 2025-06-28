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

    // Generate additional historical transactions for 2023 and early 2022
    const generateHistoricalTransactions = () => {
      const historicalTransactions = [];
      let currentId = formattedTransactions.length + 1;
      
      // Generate data for 2023 (12 months) and 2022 (6 months)
      const startDate = new Date('2022-07-01');
      const endDate = new Date('2024-01-01');
      
      // Generate 15-25 transactions per month for 18 months = ~300-450 additional transactions
      const monthsDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      for (let monthOffset = 0; monthOffset < monthsDiff; monthOffset++) {
        const monthDate = new Date(startDate);
        monthDate.setMonth(monthDate.getMonth() + monthOffset);
        
        // Generate 15-25 transactions per month
        const transactionsInMonth = 15 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < transactionsInMonth; i++) {
          const dayOfMonth = 1 + Math.floor(Math.random() * 28); // 1-28 to avoid month overflow
          const hour = Math.floor(Math.random() * 24);
          const minute = Math.floor(Math.random() * 60);
          const second = Math.floor(Math.random() * 60);
          
          const transactionDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayOfMonth, hour, minute, second);
          
          const isRevenue = Math.random() > 0.45; // 55% revenue, 45% expenses for growth
          const category = isRevenue ? 'Revenue' : 'Expense';
          const descriptions = isRevenue ? revenueDescriptions : expenseDescriptions;
          const description = descriptions[Math.floor(Math.random() * descriptions.length)];
          
          // Vary amounts realistically
          let amount;
          if (isRevenue) {
            // Revenue: $500 - $5000, with some larger deals
            amount = Math.random() > 0.1 ? 
              500 + Math.random() * 4500 : 
              5000 + Math.random() * 10000;
          } else {
            // Expenses: $100 - $3000, with some larger purchases
            amount = Math.random() > 0.15 ? 
              100 + Math.random() * 2900 : 
              3000 + Math.random() * 7000;
          }
          amount = Math.round(amount * 100) / 100; // Round to 2 decimal places
          
          const status = Math.random() > 0.2 ? 'Paid' : 'Pending'; // 80% paid, 20% pending
          const userIndex = Math.floor(Math.random() * userNames.length);
          const profileUrls = [
            "https://thispersondoesnotexist.com/",
            "https://randomuser.me/api/portraits/men/1.jpg",
            "https://randomuser.me/api/portraits/women/1.jpg",
            "https://randomuser.me/api/portraits/men/2.jpg",
            "https://randomuser.me/api/portraits/women/2.jpg"
          ];
          
          historicalTransactions.push({
            id: currentId++,
            date: transactionDate,
            amount: amount,
            description: description,
            category: category,
            status: status,
            user_id: `user_00${(userIndex % 4) + 1}`,
            user_profile: profileUrls[userIndex],
            user_name: userNames[userIndex]
          });
        }
      }
      
      return historicalTransactions;
    };

    const historicalTransactions = generateHistoricalTransactions();
    const allTransactions = [...formattedTransactions, ...historicalTransactions];

    await Transaction.insertMany(allTransactions);
    console.log(`✅ Seeded ${allTransactions.length} transactions (${formattedTransactions.length} from JSON + ${historicalTransactions.length} historical)`);

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
    console.log(`Total Transactions: ${allTransactions.length}`);
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