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
  task: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

describe('API /api/v1/studies/[studyId]/tasks', () => {
  const mockUser = { id: 'user-1', name: 'Test User' };
  const studyId = 'study-1';

  beforeEach(() => {
    jest.clearAllMocks();
    authorize.mockResolvedValue({ authorized: true, user: mockUser, message: 'Authorized' });
  });

  describe('POST /api/v1/studies/[studyId]/tasks', () => {
    it('should create a new task successfully', async () => {
      const newTaskData = {
        title: 'New Task',
        description: 'Task Description',
        isCompleted: false,
        assigneeId: null,
        dueDate: null,
      };
      const createdTask = { id: 'task-1', creatorId: mockUser.id, studyGroupId: studyId, ...newTaskData };
      prisma.task.create.mockResolvedValue(createdTask);

      const request = {
        json: async () => newTaskData,
      };
      const context = { params: { studyId } };

      const response = await POST(request, context);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Task created successfully');
      expect(data.data).toEqual(createdTask);
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          ...newTaskData,
          creatorId: mockUser.id,
          studyGroupId: studyId,
        },
      });
    });

    it('should return 401 if not authorized', async () => {
      authorize.mockResolvedValue({ authorized: false, user: null, message: 'Unauthorized' });

      const request = {
        json: async () => ({ title: 'New Task' }),
      };
      const context = { params: { studyId } };

      const response = await POST(request, context);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
      expect(prisma.task.create).not.toHaveBeenCalled();
    });

    it('should return 500 on internal server error', async () => {
      prisma.task.create.mockRejectedValue(new Error('Database error'));

      const request = {
        json: async () => ({ title: 'New Task' }),
      };
      const context = { params: { studyId } };

      const response = await POST(request, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to create task');
    });
  });

  describe('PATCH /api/v1/studies/[studyId]/tasks/[taskId]', () => {
    const taskId = 'task-1';

    it('should update an existing task successfully', async () => {
      const updateTaskData = {
        title: 'Updated Task',
        isCompleted: true,
      };
      const updatedTask = { id: taskId, creatorId: mockUser.id, studyGroupId: studyId, ...updateTaskData };
      prisma.task.update.mockResolvedValue(updatedTask);

      const request = {
        json: async () => updateTaskData,
      };
      const context = { params: { studyId, taskId } };

      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Task updated successfully');
      expect(data.data).toEqual(updatedTask);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId, studyGroupId: studyId },
        data: updateTaskData,
      });
    });

    it('should return 401 if not authorized', async () => {
      authorize.mockResolvedValue({ authorized: false, user: null, message: 'Unauthorized' });

      const request = {
        json: async () => ({ title: 'Updated Task' }),
      };
      const context = { params: { studyId, taskId } };

      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
      expect(prisma.task.update).not.toHaveBeenCalled();
    });

    it('should return 500 on internal server error', async () => {
      prisma.task.update.mockRejectedValue(new Error('Database error'));

      const request = {
        json: async () => ({ title: 'Updated Task' }),
      };
      const context = { params: { studyId, taskId } };

      const response = await PATCH(request, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to update task');
    });
  });
});
