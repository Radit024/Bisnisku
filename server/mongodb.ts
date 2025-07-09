import { MongoClient, Db, Collection } from 'mongodb';
import {
  User,
  Customer,
  TransactionCategory,
  Transaction,
  HppCalculation,
  BusinessSettings
} from '@shared/mongodb-schema';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI must be set in environment variables');
}

class MongoDB {
  private client: MongoClient;
  private db: Db;
  private static instance: MongoDB;

  private constructor() {
    this.client = new MongoClient(process.env.MONGODB_URI!);
    this.db = this.client.db('bisnisku');
  }

  static getInstance(): MongoDB {
    if (!MongoDB.instance) {
      MongoDB.instance = new MongoDB();
    }
    return MongoDB.instance;
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  // Collection getters
  get users(): Collection<User> {
    return this.db.collection<User>('users');
  }

  get customers(): Collection<Customer> {
    return this.db.collection<Customer>('customers');
  }

  get transactionCategories(): Collection<TransactionCategory> {
    return this.db.collection<TransactionCategory>('transaction_categories');
  }

  get transactions(): Collection<Transaction> {
    return this.db.collection<Transaction>('transactions');
  }

  get hppCalculations(): Collection<HppCalculation> {
    return this.db.collection<HppCalculation>('hpp_calculations');
  }

  get businessSettings(): Collection<BusinessSettings> {
    return this.db.collection<BusinessSettings>('business_settings');
  }

  // Create indexes
  async createIndexes(): Promise<void> {
    try {
      // Users indexes
      await this.users.createIndex({ firebaseUid: 1 }, { unique: true });
      await this.users.createIndex({ email: 1 }, { unique: true });

      // Customers indexes
      await this.customers.createIndex({ userId: 1 });
      await this.customers.createIndex({ email: 1 });

      // Transaction categories indexes
      await this.transactionCategories.createIndex({ userId: 1 });

      // Transactions indexes
      await this.transactions.createIndex({ userId: 1 });
      await this.transactions.createIndex({ customerId: 1 });
      await this.transactions.createIndex({ categoryId: 1 });
      await this.transactions.createIndex({ date: -1 });

      // HPP calculations indexes
      await this.hppCalculations.createIndex({ userId: 1 });

      // Business settings indexes
      await this.businessSettings.createIndex({ userId: 1 }, { unique: true });

      console.log('Indexes created successfully');
    } catch (error) {
      console.error('Error creating indexes:', error);
      throw error;
    }
  }
}

export const mongodb = MongoDB.getInstance();
export default mongodb;