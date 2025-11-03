import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfileImageChangeModal from '../ProfileImageChangeModal';
import { useUploadFileMutation } from '@/lib/api/mutations/files';
import { useUpdateUserProfileMutation } from '@/lib/api/mutations/users';
import { toast } from 'react-toastify';

// Mock the mutations
jest.mock('@/lib/api/mutations/files');
jest.mock('@/lib/api/mutations/users');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const mockUploadFileMutation = {
  mutateAsync: jest.fn(),
  isPending: false,
};
const mockUpdateUserProfileMutation = {
  mutateAsync: jest.fn(),
  isPending: false,
};

useUploadFileMutation.mockReturnValue(mockUploadFileMutation);
useUpdateUserProfileMutation.mockReturnValue(mockUpdateUserProfileMutation);

describe('ProfileImageChangeModal', () => {
  const mockOnClose = jest.fn();
  const currentImageUrl = '/current-profile.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-object-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  it('renders correctly with current image', () => {
    render(
      <ProfileImageChangeModal
        isOpen={true}
        onClose={mockOnClose}
        currentImageUrl={currentImageUrl}
      />
    );

    expect(screen.getByText('프로필 이미지 변경')).toBeInTheDocument();
    expect(screen.getByAltText('Profile Preview')).toHaveAttribute('src', currentImageUrl);
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });

  it('allows selecting a new file and shows preview', () => {
    render(
      <ProfileImageChangeModal
        isOpen={true}
        onClose={mockOnClose}
        currentImageUrl={currentImageUrl}
      />
    );

    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const input = screen.getByLabelText('파일 선택').closest('label').querySelector('input[type="file"]');

    fireEvent.change(input, { target: { files: [file] } });

    expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(screen.getByAltText('Profile Preview')).toHaveAttribute('src', 'blob:http://localhost/mock-object-url');
    expect(screen.getByRole('button', { name: '저장' })).not.toBeDisabled();
  });

  it('handles image deletion', () => {
    render(
      <ProfileImageChangeModal
        isOpen={true}
        onClose={mockOnClose}
        currentImageUrl={currentImageUrl}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '이미지 삭제' }));

    expect(screen.getByAltText('Profile Preview')).toHaveAttribute('src', '/next.svg');
    expect(screen.getByRole('button', { name: '저장' })).not.toBeDisabled();
  });

  it('saves new image by uploading and updating profile', async () => {
    mockUploadFileMutation.mutateAsync.mockResolvedValue({ fileUrl: '/new-uploaded-image.jpg' });
    mockUpdateUserProfileMutation.mutateAsync.mockResolvedValue({});

    render(
      <ProfileImageChangeModal
        isOpen={true}
        onClose={mockOnClose}
        currentImageUrl={currentImageUrl}
      />
    );

    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const input = screen.getByLabelText('파일 선택').closest('label').querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(mockUploadFileMutation.mutateAsync).toHaveBeenCalledWith({
        file: file,
        fileType: file.type,
        fileName: file.name,
      });
      expect(mockUpdateUserProfileMutation.mutateAsync).toHaveBeenCalledWith({
        imageUrl: '/new-uploaded-image.jpg',
      });
      expect(toast.success).toHaveBeenCalledWith('이미지 업로드 성공!');
      expect(toast.success).toHaveBeenCalledWith('프로필 이미지 업데이트 성공!');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('saves profile with null image if deleted', async () => {
    mockUpdateUserProfileMutation.mutateAsync.mockResolvedValue({});

    render(
      <ProfileImageChangeModal
        isOpen={true}
        onClose={mockOnClose}
        currentImageUrl={currentImageUrl}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '이미지 삭제' }));
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(mockUpdateUserProfileMutation.mutateAsync).toHaveBeenCalledWith({
        imageUrl: null,
      });
      expect(toast.info).toHaveBeenCalledWith('프로필 이미지를 삭제합니다.');
      expect(toast.success).toHaveBeenCalledWith('프로필 이미지 업데이트 성공!');
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error toast on upload failure', async () => {
    const errorMessage = 'Upload failed';
    mockUploadFileMutation.mutateAsync.mockRejectedValue(new Error(errorMessage));

    render(
      <ProfileImageChangeModal
        isOpen={true}
        onClose={mockOnClose}
        currentImageUrl={currentImageUrl}
      />
    );

    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const input = screen.getByLabelText('파일 선택').closest('label').querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('프로필 이미지 저장 실패: ' + errorMessage);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('shows error toast on profile update failure', async () => {
    const errorMessage = 'Update failed';
    mockUploadFileMutation.mutateAsync.mockResolvedValue({ fileUrl: '/new-uploaded-image.jpg' });
    mockUpdateUserProfileMutation.mutateAsync.mockRejectedValue(new Error(errorMessage));

    render(
      <ProfileImageChangeModal
        isOpen={true}
        onClose={mockOnClose}
        currentImageUrl={currentImageUrl}
      />
    );

    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const input = screen.getByLabelText('파일 선택').closest('label').querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('프로필 이미지 저장 실패: ' + errorMessage);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
