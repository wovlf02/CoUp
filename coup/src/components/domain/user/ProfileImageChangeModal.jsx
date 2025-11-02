import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import Image from "next/image";
import styles from './ProfileImageChangeModal.module.css';

export default function ProfileImageChangeModal({
  isOpen,
  onClose,
  currentImageUrl,
  onSave,
}) {
  const [previewImageUrl, setPreviewImageUrl] = useState(currentImageUrl);
  const [selectedFile, setSelectedFile] = useState(null);

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

  const handleSave = () => {
    onSave(selectedFile);
    onClose();
  };

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
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={!selectedFile && previewImageUrl === currentImageUrl}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}