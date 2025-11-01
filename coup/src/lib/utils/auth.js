import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function authorize(roles = []) {
  const user = await getCurrentUser();

  if (!user) {
    return { authorized: false, message: 'Not authenticated' };
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return { authorized: false, message: 'Not authorized' };
  }

  return { authorized: true, user };
}
