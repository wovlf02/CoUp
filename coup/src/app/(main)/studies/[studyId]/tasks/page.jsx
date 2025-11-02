import { useState } from "react";
import TaskInput from "../../../components/domain/study/task/TaskInput";
import TaskList from "../../../components/domain/study/task/TaskList";
import styles from './tasks.module.css';

export default function StudyTasksPage({ params }) {
  const { studyId } = params;
  const [tasks, setTasks] = useState([
    {
      taskId: "1",
      content: "발표 자료 준비",
      isCompleted: false,
      assigneeName: "닉네임 A",
      assigneeImageUrl: "/next.svg",
      dueDate: "2025.11.05",
      creatorName: "닉네임 B",
      createdAt: "2025.11.01",
    },
    {
      taskId: "2",
      content: "스터디 회의록 작성",
      isCompleted: true,
      assigneeName: "닉네임 C",
      assigneeImageUrl: "/next.svg",
      dueDate: "2025.10.28",
      creatorName: "닉네임 C",
      createdAt: "2025.10.27",
    },
  ]);

  const handleAddTask = (content) => {
    const newTask = {
      taskId: String(tasks.length + 1),
      content,
      isCompleted: false,
      creatorName: "현재 사용자", // Placeholder
      createdAt: new Date().toLocaleDateString("ko-KR"),
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleToggleComplete = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.taskId === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const handleEditTask = (taskId) => {
    console.log("Edit task:", taskId);
    // TODO: Implement edit functionality (e.g., open a modal)
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.taskId !== taskId));
  };

  return (
    <div className={styles.tasksPageContainer}>
      <h2 className={styles.pageTitle}>할 일</h2>
      <TaskInput onAddTask={handleAddTask} />
      <TaskList
        tasks={tasks}
        onToggleComplete={handleToggleComplete}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}