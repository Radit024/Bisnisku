import { MongoClient, ServerApiVersion } from "mongodb";

class MongoDB {
  constructor() {
    console.log("Initializing MongoDB connection...");
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
    this.client = new MongoClient(process.env.MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    this.db = this.client.db("bisnisku");
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new MongoDB();
    }
    return this.instance;
  }

  async connect() {
    try {
      console.log("Connecting to MongoDB...");
      await this.client.connect();
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }

  async disconnect() {
    await this.client.close();
  }

  // Collection getters
  get users() {
    return this.db.collection("users");
  }

  get customers() {
    return this.db.collection("customers");
  }

  get transactionCategories() {
    return this.db.collection("transaction_categories");
  }

  get transactions() {
    return this.db.collection("transactions");
  }

  get hppCalculations() {
    return this.db.collection("hpp_calculations");
  }

  get businessSettings() {
    return this.db.collection("business_settings");
  }

  // Create indexes
  async createIndexes() {
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

      console.log("Indexes created successfully");
    } catch (error) {
      console.error("Error creating indexes:", error);
      throw error;
    }
  }
}

export default MongoDB;
