import { getCurrentUser, authorize } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import prisma from '@/lib/db/prisma';

export async function GET() {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }
    return successResponse(user, 'User profile fetched successfully');
  } catch (error) {
    console.error('[API/users/me/GET]', error);
    return errorResponse('Failed to fetch user profile', 500);
  }
}

export async function PATCH(request) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const body = await request.json();
    const { name, imageUrl } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name, imageUrl },
    });

    return successResponse(updatedUser, 'User profile updated successfully');
  } catch (error) {
    console.error('[API/users/me/PATCH]', error);
    return errorResponse('Failed to update user profile', 500);
  }
}

export async function DELETE() {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    return successResponse(null, 'User account deleted successfully', 204);
  } catch (error) {
    console.error('[API/users/me/DELETE]', error);
    return errorResponse('Failed to delete user account', 500);
  }
}
