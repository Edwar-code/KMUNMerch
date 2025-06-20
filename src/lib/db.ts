import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to MongoDB via Prisma");
  } catch (error) {
    console.error("Database connection failed", error);
  }
};

export default prisma;
