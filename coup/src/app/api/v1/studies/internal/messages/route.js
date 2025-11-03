import { NextResponse } from 'next/server';
import { verifyInternalApiKey } from '@/lib/utils/auth';
import { createChatMessage } from '@/lib/services/chatService';

export async function POST(req) {
  // Verify internal API key
  const authResult = verifyInternalApiKey(req);
  if (authResult) {
    return authResult; // Return error response if API key is invalid
  }

  try {
    const { studyGroupId, senderId, content } = await req.json();

    if (!studyGroupId || !senderId || !content) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const chatMessage = await createChatMessage(studyGroupId, senderId, content);

    return NextResponse.json(chatMessage, { status: 201 });
  } catch (error) {
    console.error('Error saving chat message:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
