import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NoticeCreateEditModal from '../NoticeCreateEditModal';
import { useCreateNoticeMutation, useUpdateNoticeMutation } from '@/lib/api/mutations/notices';
import { toast } from 'react-toastify';

// Mock the mutations
jest.mock('@/lib/api/mutations/notices');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockCreateNoticeMutation = {
  mutateAsync: jest.fn(),
  isPending: false,
};
const mockUpdateNoticeMutation = {
  mutateAsync: jest.fn(),
  isPending: false,
};

useCreateNoticeMutation.mockReturnValue(mockCreateNoticeMutation);
useUpdateNoticeMutation.mockReturnValue(mockUpdateNoticeMutation);

describe('NoticeCreateEditModal', () => {
  const mockOnClose = jest.fn();
  const studyId = 'test-study-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for creating a new notice', () => {
    render(
      <NoticeCreateEditModal
        isOpen={true}
        onClose={mockOnClose}
        studyId={studyId}
      />
    );

    expect(screen.getByText('새 공지 작성')).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toHaveValue('');
    expect(screen.getByPlaceholderText('공지사항 제목을 입력하세요.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '작성' })).toBeInTheDocument();
  });

  it('renders correctly for editing an existing notice', () => {
    const existingNotice = {
      id: 'notice-1',
      title: 'Existing Notice Title',
      content: 'Existing Notice Content',
    };
    render(
      <NoticeCreateEditModal
        isOpen={true}
        onClose={mockOnClose}
        notice={existingNotice}
        studyId={studyId}
      />
    );

    expect(screen.getByText('공지 수정')).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toHaveValue(existingNotice.title);
    expect(screen.getByDisplayValue(existingNotice.content)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
  });

  it('creates a new notice on submit', async () => {
    mockCreateNoticeMutation.mutateAsync.mockResolvedValue({});

    render(
      <NoticeCreateEditModal
        isOpen={true}
        onClose={mockOnClose}
        studyId={studyId}
      />
    );

    fireEvent.change(screen.getByLabelText('제목'), { target: { value: 'New Notice' } });
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: 'New Content' } });
    fireEvent.click(screen.getByRole('button', { name: '작성' }));

    await waitFor(() => {
      expect(mockCreateNoticeMutation.mutateAsync).toHaveBeenCalledWith({
        title: 'New Notice',
        content: 'New Content',
      });
      expect(toast.success).toHaveBeenCalledWith('새 공지사항이 성공적으로 작성되었습니다.');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('updates an existing notice on submit', async () => {
    const existingNotice = {
      id: 'notice-1',
      title: 'Existing Notice Title',
      content: 'Existing Notice Content',
    };
    mockUpdateNoticeMutation.mutateAsync.mockResolvedValue({});

    render(
      <NoticeCreateEditModal
        isOpen={true}
        onClose={mockOnClose}
        notice={existingNotice}
        studyId={studyId}
      />
    );

    fireEvent.change(screen.getByLabelText('제목'), { target: { value: 'Updated Notice Title' } });
    fireEvent.click(screen.getByRole('button', { name: '수정' }));

    await waitFor(() => {
      expect(mockUpdateNoticeMutation.mutateAsync).toHaveBeenCalledWith({
        title: 'Updated Notice Title',
        content: 'Existing Notice Content',
      });
      expect(toast.success).toHaveBeenCalledWith('공지사항이 성공적으로 수정되었습니다.');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error toast if title or content is empty', async () => {
    render(
      <NoticeCreateEditModal
        isOpen={true}
        onClose={mockOnClose}
        studyId={studyId}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '작성' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('제목과 내용을 모두 입력해주세요.');
      expect(mockCreateNoticeMutation.mutateAsync).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('shows error toast on mutation failure', async () => {
    const errorMessage = 'Failed to create notice';
    mockCreateNoticeMutation.mutateAsync.mockRejectedValue(new Error(errorMessage));

    render(
      <NoticeCreateEditModal
        isOpen={true}
        onClose={mockOnClose}
        studyId={studyId}
      />
    );

    fireEvent.change(screen.getByLabelText('제목'), { target: { value: 'New Notice' } });
    fireEvent.change(screen.getByLabelText('내용'), { target: { value: 'New Content' } });
    fireEvent.click(screen.getByRole('button', { name: '작성' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('공지사항 저장 실패: ' + errorMessage);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
