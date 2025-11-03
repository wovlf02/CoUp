import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskDetailModal from '../TaskDetailModal';
import { useCreateTaskMutation, useUpdateTaskMutation } from '@/lib/api/mutations/tasks';
import { toast } from 'react-toastify';

// Mock the mutations
jest.mock('@/lib/api/mutations/tasks');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockCreateTaskMutation = {
  mutateAsync: jest.fn(),
  isPending: false,
};
const mockUpdateTaskMutation = {
  mutateAsync: jest.fn(),
  isPending: false,
};

useCreateTaskMutation.mockReturnValue(mockCreateTaskMutation);
useUpdateTaskMutation.mockReturnValue(mockUpdateTaskMutation);

describe('TaskDetailModal', () => {
  const mockOnClose = jest.fn();
  const studyId = 'test-study-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for creating a new task', () => {
    render(
      <TaskDetailModal
        isOpen={true}
        onClose={mockOnClose}
        studyId={studyId}
      />
    );

    expect(screen.getByText('새 할 일 추가')).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toHaveValue('');
    expect(screen.getByLabelText('완료됨')).not.toBeChecked();
    expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
  });

  it('renders correctly for editing an existing task', () => {
    const existingTask = {
      id: 'task-1',
      title: 'Existing Task Title',
      description: 'Existing Task Description',
      isCompleted: true,
      assigneeId: 'user-1',
      dueDate: '2025-12-31T00:00:00.000Z',
      creatorName: 'Creator',
      createdAt: '2025-11-01',
    };
    render(
      <TaskDetailModal
        isOpen={true}
        onClose={mockOnClose}
        task={existingTask}
        studyId={studyId}
      />
    );

    expect(screen.getByText('할 일 상세/수정')).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toHaveValue(existingTask.title);
    expect(screen.getByLabelText('설명')).toHaveValue(existingTask.description);
    expect(screen.getByLabelText('완료됨')).toBeChecked();
    expect(screen.getByLabelText('담당자 ID')).toHaveValue(existingTask.assigneeId);
    expect(screen.getByLabelText('마감일')).toHaveValue('2025-12-31');
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });

  it('creates a new task on submit', async () => {
    mockCreateTaskMutation.mutateAsync.mockResolvedValue({});

    render(
      <TaskDetailModal
        isOpen={true}
        onClose={mockOnClose}
        studyId={studyId}
      />
    );

    fireEvent.change(screen.getByLabelText('제목'), { target: { value: 'New Task' } });
    fireEvent.click(screen.getByRole('button', { name: '추가' }));

    await waitFor(() => {
      expect(mockCreateTaskMutation.mutateAsync).toHaveBeenCalledWith({
        title: 'New Task',
        description: null,
        isCompleted: false,
        assigneeId: null,
        dueDate: null,
      });
      expect(toast.success).toHaveBeenCalledWith('새 할 일이 성공적으로 추가되었습니다.');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('updates an existing task on submit', async () => {
    const existingTask = {
      id: 'task-1',
      title: 'Existing Task Title',
      description: 'Existing Task Description',
      isCompleted: false,
      assigneeId: 'user-1',
      dueDate: '2025-12-31T00:00:00.000Z',
      creatorName: 'Creator',
      createdAt: '2025-11-01',
    };
    mockUpdateTaskMutation.mutateAsync.mockResolvedValue({});

    render(
      <TaskDetailModal
        isOpen={true}
        onClose={mockOnClose}
        task={existingTask}
        studyId={studyId}
      />
    );

    fireEvent.change(screen.getByLabelText('제목'), { target: { value: 'Updated Task Title' } });
    fireEvent.click(screen.getByLabelText('완료됨'));
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(mockUpdateTaskMutation.mutateAsync).toHaveBeenCalledWith({
        title: 'Updated Task Title',
        description: 'Existing Task Description',
        isCompleted: true,
        assigneeId: 'user-1',
        dueDate: '2025-12-31T00:00:00.000Z',
      });
      expect(toast.success).toHaveBeenCalledWith('할 일이 성공적으로 수정되었습니다.');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error toast if title is empty', async () => {
    render(
      <TaskDetailModal
        isOpen={true}
        onClose={mockOnClose}
        studyId={studyId}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '추가' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('할 일 제목을 입력해주세요.');
      expect(mockCreateTaskMutation.mutateAsync).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('shows error toast on mutation failure', async () => {
    const errorMessage = 'Failed to create task';
    mockCreateTaskMutation.mutateAsync.mockRejectedValue(new Error(errorMessage));

    render(
      <TaskDetailModal
        isOpen={true}
        onClose={mockOnClose}
        studyId={studyId}
      />
    );

    fireEvent.change(screen.getByLabelText('제목'), { target: { value: 'New Task' } });
    fireEvent.click(screen.getByRole('button', { name: '추가' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('할 일 저장 실패: ' + errorMessage);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
