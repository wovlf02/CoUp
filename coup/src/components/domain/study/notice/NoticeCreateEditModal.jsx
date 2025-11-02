import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Button } from "../../../ui/button";
import MarkdownEditor from "../../../ui/MarkdownEditor"; // Import the new MarkdownEditor
import styles from './NoticeCreateEditModal.module.css';

export default function NoticeCreateEditModal({
  isOpen,
  onClose,
  notice = null, // If notice is provided, it's an edit operation
  onSubmit,
}) {
  const [title, setTitle] = useState(notice ? notice.title : "");
  const [content, setContent] = useState(notice ? notice.content : "");

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    onSubmit({ ...notice, title, content });
    onClose();
  };

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
              />
            </div>
          </div>
        </div>
        <DialogFooter className={styles.dialogFooter}>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {notice ? "수정" : "작성"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}