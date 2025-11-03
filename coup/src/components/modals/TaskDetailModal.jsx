import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import styles from './TaskDetailModal.module.css';
import { useCreateTaskMutation, useUpdateTaskMutation } from '@/lib/api/mutations/tasks';
import { toast } from 'react-toastify';

export default function TaskDetailModal({
  isOpen,
  onClose,
  task = null, // If task is provided, it's an edit operation
  studyId, // Added studyId prop
}) {
  const [title, setTitle] = useState(task ? task.title : ""); // Changed content to title
  const [description, setDescription] = useState(task ? task.description : ""); // Added description
  const [isCompleted, setIsCompleted] = useState(task ? task.isCompleted : false);
  const [assigneeId, setAssigneeId] = useState(task ? task.assigneeId : null); // Changed assignee to assigneeId
  const [dueDate, setDueDate] = useState(task ? task.dueDate : "");

  const createTaskMutation = useCreateTaskMutation(studyId);
  const updateTaskMutation = useUpdateTaskMutation(studyId, task?.id);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setIsCompleted(task.isCompleted);
      setAssigneeId(task.assigneeId || null);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : ""); // Format date for input
    } else {
      setTitle("");
      setDescription("");
      setIsCompleted(false);
      setAssigneeId(null);
      setDueDate("");
    }
  }, [task]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("할 일 제목을 입력해주세요.");
      return;
    }

    const taskData = {
      title,
      description: description || null,
      isCompleted,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };

    try {
      if (task) {
        await updateTaskMutation.mutateAsync(taskData);
        toast.success("할 일이 성공적으로 수정되었습니다.");
      } else {
        await createTaskMutation.mutateAsync(taskData);
        toast.success("새 할 일이 성공적으로 추가되었습니다.");
      }
      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
      toast.error("할 일 저장 실패: " + error.message);
    }
  };

  const isSaving = createTaskMutation.isPending || updateTaskMutation.isPending;

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
              disabled={isSaving}
            />
            <Label htmlFor="isCompleted" className={styles.checkboxLabel}>
              완료됨
            </Label>
          </div>
          <div className={styles.formRow}>
            <Label htmlFor="title" className={styles.labelRight}>
              제목
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="할 일 제목을 입력하세요."
              className={styles.colSpan3}
              disabled={isSaving}
            />
          </div>
          <div className={styles.formRow}>
            <Label htmlFor="description" className={styles.labelRight}>
              설명
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 설명을 입력하세요. (선택 사항)"
              className={`${styles.colSpan3} ${styles.minH80px}`}
              disabled={isSaving}
            />
          </div>
          <div className={styles.formRow}>
            <Label htmlFor="assigneeId" className={styles.labelRight}>
              담당자 ID
            </Label>
            <Input
              id="assigneeId"
              value={assigneeId || ""}
              onChange={(e) => setAssigneeId(e.target.value)}
              placeholder="담당자 사용자 ID (선택 사항)"
              className={styles.colSpan3}
              disabled={isSaving}
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
              disabled={isSaving}
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
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            취소
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (task ? "저장 중..." : "추가 중...") : (task ? "저장" : "추가")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}