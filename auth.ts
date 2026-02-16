import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { compare } from 'bcryptjs';
import mongoose from 'mongoose';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

import clientPromise from './lib/clientPromise';
import { AUTH_SECRET } from './lib/constants';
import dbConnect from './lib/db';
import { UserModel } from './models/UserModel';

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  secret: AUTH_SECRET,
  providers: [
    Google,
    Credentials({
      name: 'Credentials',
      id: 'credentials',
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials) {
          return null;
        }

        const { email, password } = credentials;

        await dbConnect();

        const user = await UserModel.findOne({
          email: (email as string).toLowerCase(),
        });

        if (!user || user.isDeleted) {
          return null;
        }

        const passwordCorrect = await compare(
          password as string,
          user.password as string
        );

        if (passwordCorrect) {
          // Don't throw error here - just return null if not verified
          // We'll handle verification check in the frontend
          if (!user.emailVerified && user.provider !== 'google') {
            return null;
          }

          return {
            id: user._id?.toString(),
            email: user.email,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      // First assign the ID
      session.user.id = token.sub as string;

      // Check if user is deleted
      try {
        await dbConnect();
        const user = await UserModel.findById(token.sub);
        if (user?.isDeleted) {
          // Return empty session to force re-login
          return {} as any;
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        // Continue with session in case of DB error
      }

      return session;
    },
    // Add JWT callback to check user status
    async jwt({ token }) {
      // You can add additional checks here if needed
      return token;
    },
  },
  events: {
    async createUser({ user }) {
      await dbConnect();

      // Access collection directly to bypass potential Mongoose issues
      const db = mongoose.connection.db;
      if (db) {
        await db.collection('users').updateOne(
          { _id: new mongoose.Types.ObjectId(user.id) },
          {
            $set: {
              createdAt: new Date(),
              updatedAt: new Date(),
              // Default to false, will be updated in linkAccount if it's a Google login
              emailVerified: false,
              provider: 'credentials',
              // Add missing defaults from UserModel schema
              isAdmin: false,
              language: 'en',
              isDeleted: false,
            },
          }
        );
      }
    },
    async linkAccount({ user, account }) {
      await dbConnect();

      if (account.provider === 'google') {
        await UserModel.findByIdAndUpdate(user.id, {
          emailVerified: true,
          provider: 'google',
        });
      }
    },
  },
});
