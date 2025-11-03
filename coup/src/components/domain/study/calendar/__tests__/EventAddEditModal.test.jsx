import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventAddEditModal from '../EventAddEditModal';
import { useCreateEventMutation, useUpdateEventMutation } from '@/lib/api/mutations/events';
import { toast } from 'react-toastify';

// Mock the mutations
jest.mock('@/lib/api/mutations/events');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockCreateEventMutation = {
  mutateAsync: jest.fn(),
  isPending: false,
};
const mockUpdateEventMutation = {
  mutateAsync: jest.fn(),
  isPending: false,
};

useCreateEventMutation.mockReturnValue(mockCreateEventMutation);
useUpdateEventMutation.mockReturnValue(mockUpdateEventMutation);

describe('EventAddEditModal', () => {
  const mockOnClose = jest.fn();
  const studyId = 'test-study-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for adding a new event', () => {
    render(
      <EventAddEditModal
        isOpen={true}
        onClose={mockOnClose}
        studyId={studyId}
      />
    );

    expect(screen.getByText('새 일정 추가')).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toHaveValue('');
    expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
  });

  it('renders correctly for editing an existing event', () => {
    const existingEvent = {
      id: 'event-1',
      title: 'Existing Event Title',
      description: 'Existing Event Description',
      startTime: '2025-12-01T10:00:00.000Z',
      endTime: '2025-12-01T11:00:00.000Z',
    };
    render(
      <EventAddEditModal
        isOpen={true}
        onClose={mockOnClose}
        event={existingEvent}
        studyId={studyId}
      />
    );

    expect(screen.getByText('일정 수정')).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toHaveValue(existingEvent.title);
    expect(screen.getByLabelText('설명')).toHaveValue(existingEvent.description);
    expect(screen.getByLabelText('시작일')).toHaveValue('2025-12-01');
    expect(screen.getByLabelText('시작 시간')).toHaveValue('10:00');
    expect(screen.getByLabelText('종료일')).toHaveValue('2025-12-01');
    expect(screen.getByLabelText('종료 시간')).toHaveValue('11:00');
    expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
  });

  it('creates a new event on submit', async () => {
    mockCreateEventMutation.mutateAsync.mockResolvedValue({});

    render(
      <EventAddEditModal
        isOpen={true}
        onClose={mockOnClose}
        studyId={studyId}
      />
    );

    fireEvent.change(screen.getByLabelText('제목'), { target: { value: 'New Event' } });
    fireEvent.change(screen.getByLabelText('시작일'), { target: { value: '2025-12-05' } });
    fireEvent.change(screen.getByLabelText('시작 시간'), { target: { value: '09:00' } });
    fireEvent.change(screen.getByLabelText('종료일'), { target: { value: '2025-12-05' } });
    fireEvent.change(screen.getByLabelText('종료 시간'), { target: { value: '10:00' } });
    fireEvent.click(screen.getByRole('button', { name: '추가' }));

    await waitFor(() => {
      expect(mockCreateEventMutation.mutateAsync).toHaveBeenCalledWith({
        title: 'New Event',
        description: null,
        startTime: '2025-12-05T09:00:00.000Z',
        endTime: '2025-12-05T10:00:00.000Z',
      });
      expect(toast.success).toHaveBeenCalledWith('새 일정이 성공적으로 추가되었습니다.');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('updates an existing event on submit', async () => {
    const existingEvent = {
      id: 'event-1',
      title: 'Existing Event Title',
      description: 'Existing Event Description',
      startTime: '2025-12-01T10:00:00.000Z',
      endTime: '2025-12-01T11:00:00.000Z',
    };
    mockUpdateEventMutation.mutateAsync.mockResolvedValue({});

    render(
      <EventAddEditModal
        isOpen={true}
        onClose={mockOnClose}
        event={existingEvent}
        studyId={studyId}
      />
    );

    fireEvent.change(screen.getByLabelText('제목'), { target: { value: 'Updated Event Title' } });
    fireEvent.click(screen.getByRole('button', { name: '수정' }));

    await waitFor(() => {
      expect(mockUpdateEventMutation.mutateAsync).toHaveBeenCalledWith({
        title: 'Updated Event Title',
        description: 'Existing Event Description',
        startTime: '2025-12-01T10:00:00.000Z',
        endTime: '2025-12-01T11:00:00.000Z',
      });
      expect(toast.success).toHaveBeenCalledWith('일정이 성공적으로 수정되었습니다.');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error toast if required fields are empty', async () => {
    render(
      <EventAddEditModal
        isOpen={true}
        onClose={mockOnClose}
        studyId={studyId}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '추가' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('모든 필수 항목을 입력해주세요.');
      expect(mockCreateEventMutation.mutateAsync).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('shows error toast on mutation failure', async () => {
    const errorMessage = 'Failed to create event';
    mockCreateEventMutation.mutateAsync.mockRejectedValue(new Error(errorMessage));

    render(
      <EventAddEditModal
        isOpen={true}
        onClose={mockOnClose}
        studyId={studyId}
      />
    );

    fireEvent.change(screen.getByLabelText('제목'), { target: { value: 'New Event' } });
    fireEvent.change(screen.getByLabelText('시작일'), { target: { value: '2025-12-05' } });
    fireEvent.change(screen.getByLabelText('시작 시간'), { target: { value: '09:00' } });
    fireEvent.change(screen.getByLabelText('종료일'), { target: { value: '2025-12-05' } });
    fireEvent.change(screen.getByLabelText('종료 시간'), { target: { value: '10:00' } });
    fireEvent.click(screen.getByRole('button', { name: '추가' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('일정 저장 실패: ' + errorMessage);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
