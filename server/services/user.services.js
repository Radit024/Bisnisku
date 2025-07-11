import { ObjectId } from 'mongodb';
import { db } from '../db';
import { userSchema, insertUserSchema } from '@shared/schema';

export class UserService {
  async createUser(userData) {
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

  async getUserById(id) {
    const user = await db.users.findOne({ _id: id });
    return user ? userSchema.parse(user) : null;
  }

  async getUserByFirebaseUid(firebaseUid) {
    const user = await db.users.findOne({ firebaseUid });
    return user ? userSchema.parse(user) : null;
  }

  async getUserByEmail(email) {
    const user = await db.users.findOne({ email });
    return user ? userSchema.parse(user) : null;
  }

  async updateUser(id, userData) {
    const result = await db.users.findOneAndUpdate(
      { _id: id },
      { $set: userData },
      { returnDocument: 'after' }
    );

    return result ? userSchema.parse(result) : null;
  }

  async deleteUser(id) {
    const result = await db.users.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

export const userService = new UserService();