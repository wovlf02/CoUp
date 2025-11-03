import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import Image from "next/image";
import styles from './ProfileImageChangeModal.module.css';
import { useUploadFileMutation } from '@/lib/api/mutations/files';
import { useUpdateUserProfileMutation } from '@/lib/api/mutations/users';
import { toast } from 'react-toastify'; // Assuming toast notifications are available

export default function ProfileImageChangeModal({
  isOpen,
  onClose,
  currentImageUrl,
  onSave, // This prop might become redundant if mutations are handled internally
}) {
  const [previewImageUrl, setPreviewImageUrl] = useState(currentImageUrl);
  const [selectedFile, setSelectedFile] = useState(null);

  const uploadFileMutation = useUploadFileMutation();
  const updateUserProfileMutation = useUpdateUserProfileMutation();

  useEffect(() => {
    setPreviewImageUrl(currentImageUrl);
    setSelectedFile(null);
  }, [currentImageUrl, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImageUrl(URL.createObjectURL(file));
    }
  };

  const handleDeleteImage = () => {
    setPreviewImageUrl("/next.svg"); // Reset to default placeholder
    setSelectedFile(null);
  };

  const handleSave = async () => {
    try {
      let newImageUrl = currentImageUrl;

      if (selectedFile) {
        // Upload new file
        const uploadedFile = await uploadFileMutation.mutateAsync({
          file: selectedFile,
          fileType: selectedFile.type,
          fileName: selectedFile.name,
          // studyId: null, // Profile images are not tied to a specific study
        });
        newImageUrl = uploadedFile.fileUrl;
        toast.success("이미지 업로드 성공!");
      } else if (previewImageUrl === "/next.svg" && currentImageUrl !== "/next.svg") {
        // User explicitly deleted the image
        newImageUrl = null; // Or a specific default image URL if desired
        toast.info("프로필 이미지를 삭제합니다.");
      }

      // Only update profile if image URL has changed
      if (newImageUrl !== currentImageUrl) {
        await updateUserProfileMutation.mutateAsync({ imageUrl: newImageUrl });
        toast.success("프로필 이미지 업데이트 성공!");
      }

      onClose();
    } catch (error) {
      console.error("Failed to save profile image:", error);
      toast.error("프로필 이미지 저장 실패: " + error.message);
    }
  };

  const isSaving = uploadFileMutation.isPending || updateUserProfileMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>프로필 이미지 변경</DialogTitle>
        </DialogHeader>
        <div className={styles.contentWrapper}>
          <div className={styles.imagePreviewContainer}>
            <Image
              src={previewImageUrl || "/next.svg"}
              alt="Profile Preview"
              fill
              className={styles.imagePreview}
            />
          </div>
          <div className={styles.uploadArea}>
            <p className={styles.uploadText}>여기에 이미지를 드래그하거나 클릭하세요.</p>
            <input type="file" accept="image/*" className={styles.hiddenInput} id="file-upload" onChange={handleFileChange} />
            <label htmlFor="file-upload">
              <Button variant="secondary" asChild>
                <span>파일 선택</span>
              </Button>
            </label>
          </div>
          <Button variant="destructive" onClick={handleDeleteImage} disabled={previewImageUrl === "/next.svg"}>
            이미지 삭제
          </Button>
        </div>
        <DialogFooter className={styles.dialogFooter}>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSaving || (!selectedFile && previewImageUrl === currentImageUrl)}>
            {isSaving ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}