import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  id: number;
  date: Date;
  amount: number;
  description: string;
  category: 'Revenue' | 'Expense';
  status: 'Paid' | 'Pending';
  user_id: string;
  user_profile: string;
  createdAt: Date;
}

const TransactionSchema: Schema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Revenue', 'Expense']
  },
  status: {
    type: String,
    required: true,
    enum: ['Paid', 'Pending']
  },
  user_id: {
    type: String,
    required: true
  },
  user_profile: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
TransactionSchema.index({ user_id: 1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ date: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema); 