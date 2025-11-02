import { Checkbox } from "../../../ui/checkbox";
import { Button } from "../../../ui/button";
import Image from "next/image";
import styles from './TaskItem.module.css';

export default function TaskItem({
  taskId,
  content,
  isCompleted,
  assigneeName,
  assigneeImageUrl,
  dueDate,
  creatorName,
  createdAt,
  onToggleComplete,
  onEdit,
  onDelete,
}) {
  return (
    <div className={styles.taskItemContainer}>
      <Checkbox
        id={`task-${taskId}`}
        checked={isCompleted}
        onCheckedChange={() => onToggleComplete(taskId)}
        className={styles.checkbox}
      />
      <div className={styles.contentWrapper}>
        <label
          htmlFor={`task-${taskId}`}
          className={`${styles.taskLabel} ${isCompleted ? styles.completedTask : styles.pendingTask}`}
        >
          {content}
        </label>
        <div className={styles.metaInfo}>
          {assigneeName && (
            <span className={styles.assigneeInfo}>
              <Image
                src={assigneeImageUrl || "/next.svg"}
                alt={assigneeName}
                width={16}
                height={16}
                className={styles.assigneeImage}
              />
              담당: {assigneeName}
            </span>
          )}
          {dueDate && <span>마감: {dueDate}</span>}
          <span>작성: {creatorName}</span>
          <span>{createdAt}</span>
        </div>
      </div>
      <div className={styles.actionButtons}>
        <Button variant="outline" size="sm" onClick={() => onEdit(taskId)}>
          수정
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDelete(taskId)}>
          삭제
        </Button>
      </div>
    </div>
  );
}