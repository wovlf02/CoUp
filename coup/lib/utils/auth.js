import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function authorize() {
  const session = await getSession();
  if (!session || !session.user) {
    return { authorized: false, user: null, message: 'Not authenticated' };
  }
  return { authorized: true, user: session.user, message: 'Authenticated' };
}

export function verifyInternalApiKey(req) {
  const internalApiKey = req.headers.get('x-internal-api-key');
  if (!internalApiKey || internalApiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ message: 'Unauthorized: Invalid internal API key' }, { status: 401 });
  }
  return null; // API key is valid
}
