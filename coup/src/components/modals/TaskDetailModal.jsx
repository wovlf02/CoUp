import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import styles from './TaskDetailModal.module.css';

export default function TaskDetailModal({
  isOpen,
  onClose,
  task = null, // If task is provided, it's an edit operation
  onSubmit,
}) {
  const [content, setContent] = useState(task ? task.content : "");
  const [isCompleted, setIsCompleted] = useState(task ? task.isCompleted : false);
  const [assignee, setAssignee] = useState(task ? task.assigneeName : "");
  const [dueDate, setDueDate] = useState(task ? task.dueDate : "");

  useEffect(() => {
    if (task) {
      setContent(task.content);
      setIsCompleted(task.isCompleted);
      setAssignee(task.assigneeName || "");
      setDueDate(task.dueDate || "");
    } else {
      setContent("");
      setIsCompleted(false);
      setAssignee("");
      setDueDate("");
    }
  }, [task]);

  const handleSubmit = () => {
    if (!content.trim()) {
      alert("할 일 내용을 입력해주세요.");
      return;
    }
    onSubmit({
      ...task,
      content,
      isCompleted,
      assigneeName: assignee,
      dueDate,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>{task ? "할 일 상세/수정" : "새 할 일 추가"}</DialogTitle>
        </DialogHeader>
        <div className={styles.formGrid}>
          <div className={styles.checkboxRow}>
            <Checkbox
              id="isCompleted"
              checked={isCompleted}
              onCheckedChange={setIsCompleted}
            />
            <Label htmlFor="isCompleted" className={styles.checkboxLabel}>
              완료됨
            </Label>
          </div>
          <div className={styles.formRow}>
            <Label htmlFor="content" className={styles.labelRight}>
              내용
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="할 일 내용을 입력하세요."
              className={`${styles.colSpan3} ${styles.minH80px}`}
            />
          </div>
          <div className={styles.formRow}>
            <Label htmlFor="assignee" className={styles.labelRight}>
              담당자
            </Label>
            <Input
              id="assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="담당자 닉네임 (선택 사항)"
              className={styles.colSpan3}
            />
          </div>
          <div className={styles.formRow}>
            <Label htmlFor="dueDate" className={styles.labelRight}>
              마감일
            </Label>
            <Input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={styles.colSpan3}
            />
          </div>
          {task && (
            <div className={styles.taskInfoRow}>
              <span className={styles.labelRight}>작성자:</span>
              <span className={styles.colSpan3}>{task.creatorName}</span>
              <span className={styles.labelRight}>생성일:</span>
              <span className={styles.colSpan3}>{task.createdAt}</span>
            </div>
          )}
        </div>
        <DialogFooter className={styles.dialogFooter}>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {task ? "저장" : "추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}