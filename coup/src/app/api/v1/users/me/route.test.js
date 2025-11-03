import { PATCH } from '../route'; // Import the actual PATCH handler
import { NextResponse } from 'next/server';
import { authorize } from '@/lib/utils/auth';
import prisma from '@/lib/db/prisma';

// Mock the authorize function
jest.mock('@/lib/utils/auth', () => ({
  authorize: jest.fn(),
  getCurrentUser: jest.fn(),
}));

// Mock Prisma Client
jest.mock('@/lib/db/prisma', () => ({
  user: {
    update: jest.fn(),
  },
}));

describe('PATCH /api/v1/users/me', () => {
  const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com', imageUrl: null };

  beforeEach(() => {
    jest.clearAllMocks();
    authorize.mockResolvedValue({ authorized: true, user: mockUser, message: 'Authorized' });
  });

  it('should update user profile image successfully', async () => {
    const newImageUrl = 'http://example.com/new-image.jpg';
    const updatedUser = { ...mockUser, imageUrl: newImageUrl };
    prisma.user.update.mockResolvedValue(updatedUser);

    const request = {
      json: async () => ({ imageUrl: newImageUrl }),
    };

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('User profile updated successfully');
    expect(data.data).toEqual(updatedUser);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: { imageUrl: newImageUrl },
    });
  });

  it('should return 401 if not authorized', async () => {
    authorize.mockResolvedValue({ authorized: false, user: null, message: 'Unauthorized' });

    const request = {
      json: async () => ({ imageUrl: 'http://example.com/new-image.jpg' }),
    };

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe('Unauthorized');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('should return 500 on internal server error', async () => {
    prisma.user.update.mockRejectedValue(new Error('Database error'));

    const request = {
      json: async () => ({ imageUrl: 'http://example.com/new-image.jpg' }),
    };

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe('Failed to update user profile');
  });
});
