import { ObjectId } from 'mongodb';
import { db } from '../db';
import { User, InsertUser, userSchema, insertUserSchema } from '@shared/schema';

export class UserService {
  async createUser(userData: InsertUser): Promise<User> {
    const validatedData = insertUserSchema.parse(userData);
    
    const userWithTimestamp = {
      ...validatedData,
      createdAt: new Date(),
    };

    const result = await db.users.insertOne(userWithTimestamp);
    
    const user = await db.users.findOne({ _id: result.insertedId });
    if (!user) {
      throw new Error('Failed to create user');
    }

    return userSchema.parse(user);
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await db.users.findOne({ _id: new ObjectId(id) });
    return user ? userSchema.parse(user) : null;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const user = await db.users.findOne({ firebaseUid });
    return user ? userSchema.parse(user) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await db.users.findOne({ email });
    return user ? userSchema.parse(user) : null;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | null> {
    const result = await db.users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: userData },
      { returnDocument: 'after' }
    );

    return result ? userSchema.parse(result) : null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.users.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}

export const userService = new UserService();