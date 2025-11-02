import TaskItem from "./TaskItem";
import styles from './TaskList.module.css';

export default function TaskList({ tasks, onToggleComplete, onEdit, onDelete }) {
  return (
    <div className={styles.taskListContainer}>
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <TaskItem
            key={task.taskId}
            {...task}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      ) : (
        <p className={styles.emptyMessage}>
          아직 등록된 할 일이 없습니다. 첫 할 일을 추가해보세요!
        </p>
      )}
    </div>
  );
}