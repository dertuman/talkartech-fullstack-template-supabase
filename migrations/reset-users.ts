import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { UserModel } from '../models/UserModel';
import { createRandomUser } from './user-utils';

dotenv.config();

async function migrateUsers() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in the environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await UserModel.find({});
    const updatePromises = users.map(async (user) => {
      const randomData = createRandomUser();

      const preservedFields = {
        _id: user._id,
        email: user.email,
        password: user.password,
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: new Date(),
      };

      const updateData = {
        ...randomData,
        ...preservedFields,
      };

      return UserModel.updateOne({ _id: user._id }, { $set: updateData });
    });

    const results = await Promise.all(updatePromises);
    const modifiedCount = results.filter((r) => r.modifiedCount > 0).length;
    console.log(`Updated ${modifiedCount} users`);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateUsers().catch(console.error);
