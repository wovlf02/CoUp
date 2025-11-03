import { authorize } from '@/lib/utils/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { getUserById, updateUserProfile, deleteUser } from '@/lib/services/userService';

export async function GET() {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }
    const fetchedUser = await getUserById(user.id);
    return successResponse(fetchedUser, 'User profile fetched successfully');
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
    const { name, imageUrl, bio } = body;

    const updatedUser = await updateUserProfile(user.id, { name, imageUrl, bio });

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

    await deleteUser(user.id);

    return successResponse(null, 'User account deleted successfully', 204);
  } catch (error) {
    console.error('[API/users/me/DELETE]', error);
    return errorResponse('Failed to delete user account', 500);
  }
}
