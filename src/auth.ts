import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { type UserRole } from "@prisma/client";

const prisma = new PrismaClient();

// Extend the built-in Session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    };
  }
}

declare module "next-auth" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    debug: true, 
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "name@example.com" },
        password: { label: "Password", type: "password", placeholder: "********" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentials as {
            email: string;
            password: string;
          };

          if (!email || !password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              role: true,
            },
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Error in authorize function:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account && account.provider === 'google') {
        // For Google, the user info comes in the profile object
        const profileEmail = profile?.email as string;
        const googleUser = await prisma.user.findUnique({
          where: { email: profileEmail },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });

        if (googleUser) {
          token.id = googleUser.id;
          token.role = googleUser.role;
        } else {
          console.log('Creating the user in the database');
          // Create the user and associate with the google account
          const newUser = await prisma.user.create({
            data: {
              name: profile?.name as string,
              email: profile?.email as string,
              password: await bcrypt.hash(crypto.randomUUID(), 10),
              number: "",
              role: "customer"
            },
          });

          token.id = newUser.id;
          token.role = newUser.role;
        }
      } else if (user) {
        // For credential login
        token.id = user.id;
        token.role = 'role' in user ? (user as { role: UserRole }).role : 'customer';
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
});

// Cleanup Prisma connection
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
