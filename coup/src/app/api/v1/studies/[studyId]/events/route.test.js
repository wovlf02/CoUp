import { POST, PATCH } from '../route'; // Import the actual handlers
import { authorize } from '@/lib/utils/auth';
import prisma from '@/lib/db/prisma';

// Mock the authorize function
jest.mock('@/lib/utils/auth', () => ({
  authorize: jest.fn(),
  getCurrentUser: jest.fn(),
}));

// Mock Prisma Client
jest.mock('@/lib/db/prisma', () => ({
  event: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

describe('API /api/v1/studies/[studyId]/events', () => {
  const mockUser = { id: 'user-1', name: 'Test User' };
  const studyId = 'study-1';

  beforeEach(() => {
    jest.clearAllMocks();
    authorize.mockResolvedValue({ authorized: true, user: mockUser, message: 'Authorized' });
  });

  describe('POST /api/v1/studies/[studyId]/events', () => {
    it('should create a new event successfully', async () => {
      const newEventData = {
        title: 'New Event',
        description: 'Event Description',
        startTime: '2025-12-01T10:00:00.000Z',
        endTime: '2025-12-01T11:00:00.000Z',
      };
      const createdEvent = { id: 'event-1', creatorId: mockUser.id, studyGroupId: studyId, ...newEventData };
      prisma.event.create.mockResolvedValue(createdEvent);

      const request = {
        json: async () => newEventData,
      };
      const context = { params: { studyId } };

      const response = await POST(request, context);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Event created successfully');
      expect(data.data).toEqual(createdEvent);
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          ...newEventData,
          creatorId: mockUser.id,
          studyGroupId: studyId,
        },
      });
    });

    it('should return 401 if not authorized', async () => {
      authorize.mockResolvedValue({ authorized: false, user: null, message: 'Unauthorized' });

      const request = {
        json: async () => ({ title: 'New Event' }),
      };
      const context = { params: { studyId } };

      const response = await POST(request, context);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
      expect(prisma.event.create).not.toHaveBeenCalled();
    });

    it('should return 500 on internal server error', async () => {
      prisma.event.create.mockRejectedValue(new Error('Database error'));

      const request = {
        json: async () => ({ title: 'New Event' }),
      };
      const context = { params: { studyId } };

      const response = await POST(request, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to create event');
    });
  });

  describe('PATCH /api/v1/studies/[studyId]/events/[eventId]', () => {
    const eventId = 'event-1';

    it('should update an existing event successfully', async () => {
      const updateEventData = {
        title: 'Updated Event',
        description: 'Updated Description',
        startTime: '2025-12-01T10:00:00.000Z',
        endTime: '2025-12-01T11:00:00.000Z',
      };
      const updatedEvent = { id: eventId, creatorId: mockUser.id, studyGroupId: studyId, ...updateEventData };
      prisma.event.update.mockResolvedValue(updatedEvent);

      const request = {
        json: async () => updateEventData,
      };
      const context = { params: { studyId, eventId } };

      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Event updated successfully');
      expect(data.data).toEqual(updatedEvent);
      expect(prisma.event.update).toHaveBeenCalledWith({
        where: { id: eventId, studyGroupId: studyId },
        data: updateEventData,
      });
    });

    it('should return 401 if not authorized', async () => {
      authorize.mockResolvedValue({ authorized: false, user: null, message: 'Unauthorized' });

      const request = {
        json: async () => ({ title: 'Updated Event' }),
      };
      const context = { params: { studyId, eventId } };

      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
      expect(prisma.event.update).not.toHaveBeenCalled();
    });

    it('should return 500 on internal server error', async () => {
      prisma.event.update.mockRejectedValue(new Error('Database error'));

      const request = {
        json: async () => ({ title: 'Updated Event' }),
      };
      const context = { params: { studyId, eventId } };

      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to update event');
    });
  });
});
