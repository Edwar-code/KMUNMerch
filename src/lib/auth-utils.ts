import { auth } from '@/auth';

export const isAdmin = async () => {
  const session = await auth();
  return session?.user?.role === 'admin';
};

export const isAuthenticated = async () => {
  const session = await auth();
  return !!session?.user;
};