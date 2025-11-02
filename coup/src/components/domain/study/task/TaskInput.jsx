import { useState } from "react";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import styles from './TaskInput.module.css';

export default function TaskInput({ onAddTask }) {
  const [taskContent, setTaskContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskContent.trim()) {
      onAddTask(taskContent);
      setTaskContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.taskInputForm}>
      <Input
        type="text"
        placeholder="새로운 할 일을 입력하세요."
        value={taskContent}
        onChange={(e) => setTaskContent(e.target.value)}
        className={styles.taskInput}
      />
      <Button type="submit" variant="primary">
        추가
      </Button>
    </form>
  );
}