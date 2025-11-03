import { NextResponse } from 'next/server';
import { verifyInternalApiKey } from '@/lib/utils/auth';
import { updateUserOnlineStatus } from '@/lib/services/userService';

export async function POST(req) {
  // Verify internal API key
  const authResult = verifyInternalApiKey(req);
  if (authResult) {
    return authResult; // Return error response if API key is invalid
  }

  try {
    const { userId, isOnline } = await req.json();

    if (!userId || typeof isOnline !== 'boolean') {
      return NextResponse.json({ message: 'Missing required fields or invalid types' }, { status: 400 });
    }

    const updatedUser = await updateUserOnlineStatus(userId, isOnline);

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating user online status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
