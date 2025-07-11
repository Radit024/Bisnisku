import { eq, desc, and, sum, count, gte, lte } from 'drizzle-orm';

class DatabaseStorage {
  constructor(MongoDB = undefined) {
    if (!MongoDB) {
      throw new Error("MongoDB instance must be provided");
    }
    this.MongoDB = MongoDB;
    this.db = MongoDB;
  }

  async getUser(id) {
    const [user] = await this.db.users.find({ _id: id }).toArray();
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid) {
    const [user] = await this.db.users.find({ firebaseUid }).toArray();
    return user || undefined;
  }

  async createUser(insertUser) {
    const [user] = await this.db.users.insertOne(insertUser).toArray();
    return user;
  }

  async getCustomers(userId) {
    return await this.db.customers.find({ userId }).toArray();
  }

  async getCustomer(id, userId) {
    const [customer] = await this.db.customers.find({ _id: id, userId }).toArray();
    return customer || undefined;
  }

  async createCustomer(customer) {
    const [newCustomer] = await this.db.customers.insertOne(customer).toArray();
    return newCustomer;
  }

  async updateCustomer(id, customer, userId) {
    const [updated] = await this.db.customers.updateOne({ _id: id, userId }, { $set: customer });
    return updated || undefined;
  }

  async deleteCustomer(id, userId) {
    const result = await this.db.customers.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }

  async getTransactionCategories(userId) {
    return await this.db.transactionCategories.find({ userId }).toArray();
  }

  async createTransactionCategory(category) {
    const [newCategory] = await this.db.transactionCategories.insertOne(category).toArray();
    return newCategory;
  }

  async getTransactions(userId, limit) {
    let query = this.db.transactions.find({ userId }).sort({ date: -1 });
    if (limit) {
      query = query.limit(limit);
    }
    return await query.toArray();
  }

  async getTransaction(id, userId) {
    const [transaction] = await this.db.transactions.find({ _id: id, userId }).toArray();
    return transaction || undefined;
  }

  async createTransaction(transaction) {
    const [newTransaction] = await this.db.transactions.insertOne(transaction).toArray();
    return newTransaction;
  }

  async getTransaction(id, userId) {
    const [transaction] = await this.db.transactions.find({ _id: id, userId }).toArray();
    return transaction || undefined;
  }

  async createTransaction(transaction) {
    const [newTransaction] = await this.db.transactions.insertOne(transaction).toArray();
    return newTransaction;
  }

  async updateTransaction(id, transaction, userId) {
    const [updated] = await this.db.transactions.updateOne({ _id: id, userId }, { $set: transaction });
    return updated || undefined;
  }

  async deleteTransaction(id, userId) {
    const result = await this.db.transactions.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
  }

  async getTransactionsByDateRange(userId, startDate, endDate) {
    return await this.db.transactions.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).toArray();
  }

  async getHppCalculations(userId) {
    return await this.db.hppCalculations.find({ userId }).toArray();
  }

  async createHppCalculation(calculation) {
    const [newCalculation] = await this.db.hppCalculations.insertOne(calculation).toArray();
    return newCalculation;
  }

  async getBusinessSettings(userId) {
    const [settings] = await this.db.businessSettings.find({ userId }).toArray();
    return settings || undefined;
  }

  async upsertBusinessSettings(settings) {
    const existing = await this.getBusinessSettings(settings.userId);
    if (existing) {
      const [updated] = await this.db.businessSettings.updateOne(
        { userId: settings.userId },
        { $set: { ...settings, updatedAt: new Date() } } 
      );
      return updated;
    } else {
      const [created] = await this.db.businessSettings.insertOne(settings);
      return created;
    }
  }

  async getFinancialSummary(userId, startDate, endDate) {
    const transactionsInRange = await this.getTransactionsByDateRange(
      userId,
      startDate,
      endDate
    );

    const totalIncome = transactionsInRange
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpense = transactionsInRange
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const netProfit = totalIncome - totalExpense;

    return {
      totalIncome: totalIncome.toString(),
      totalExpense: totalExpense.toString(),
      netProfit: netProfit.toString(),
      transactionCount: transactionsInRange.length,
    };
  }
}

export default DatabaseStorage;