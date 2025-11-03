import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Button } from "../../../ui/button";
import MarkdownEditor from "../../../ui/MarkdownEditor";
import styles from './NoticeCreateEditModal.module.css';
import { useCreateNoticeMutation, useUpdateNoticeMutation } from '@/lib/api/mutations/notices';
import { toast } from 'react-toastify';

export default function NoticeCreateEditModal({
  isOpen,
  onClose,
  notice = null, // If notice is provided, it's an edit operation
  studyId, // Added studyId prop
}) {
  const [title, setTitle] = useState(notice ? notice.title : "");
  const [content, setContent] = useState(notice ? notice.content : "");

  const createNoticeMutation = useCreateNoticeMutation(studyId);
  const updateNoticeMutation = useUpdateNoticeMutation(studyId, notice?.id);

  useEffect(() => {
    if (notice) {
      setTitle(notice.title);
      setContent(notice.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [notice]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }

    const noticeData = {
      title,
      content,
    };

    try {
      if (notice) {
        await updateNoticeMutation.mutateAsync(noticeData);
        toast.success("공지사항이 성공적으로 수정되었습니다.");
      } else {
        await createNoticeMutation.mutateAsync(noticeData);
        toast.success("새 공지사항이 성공적으로 작성되었습니다.");
      }
      onClose();
    } catch (error) {
      console.error("Failed to save notice:", error);
      toast.error("공지사항 저장 실패: " + error.message);
    }
  };

  const isSaving = createNoticeMutation.isPending || updateNoticeMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>{notice ? "공지 수정" : "새 공지 작성"}</DialogTitle>
        </DialogHeader>
        <div className={styles.formGrid}>
          <div className={styles.formRow}>
            <Label htmlFor="title" className={styles.labelRight}>
              제목
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지사항 제목을 입력하세요."
              className={styles.colSpan3}
              disabled={isSaving}
            />
          </div>
          <div className={`${styles.formRow} ${styles.formRowStart}`}>
            <Label htmlFor="content" className={styles.labelRight}>
              내용
            </Label>
            <div className={styles.colSpan3}> {/* Wrap MarkdownEditor in a div to apply grid column */} 
              <MarkdownEditor
                value={content}
                onChange={(e) => setContent(e.target.value)}
                minHeight="200px"
                disabled={isSaving}
              />
            </div>
          </div>
        </div>
        <DialogFooter className={styles.dialogFooter}>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            취소
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (notice ? "수정 중..." : "작성 중...") : (notice ? "수정" : "작성")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}