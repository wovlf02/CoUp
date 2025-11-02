import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Button } from "../../../ui/button";
import styles from './EventAddEditModal.module.css';

export default function EventAddEditModal({
  isOpen,
  onClose,
  event = null, // If event is provided, it's an edit operation
  onSubmit,
}) {
  const [title, setTitle] = useState(event ? event.title : "");
  const [description, setDescription] = useState(event ? event.description : "");
  const [startDate, setStartDate] = useState(event ? event.startDate : "");
  const [startTime, setStartTime] = useState(event ? event.startTime : "");
  const [endDate, setEndDate] = useState(event ? event.endDate : "");
  const [endTime, setEndTime] = useState(event ? event.endTime : "");

  const handleSubmit = () => {
    if (!title.trim() || !startDate.trim() || !startTime.trim() || !endDate.trim() || !endTime.trim()) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }
    onSubmit({ ...event, title, description, startDate, startTime, endDate, endTime });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>{event ? "일정 수정" : "새 일정 추가"}</DialogTitle>
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
              placeholder="일정 제목을 입력하세요."
              className={styles.colSpan3}
            />
          </div>
          <div className={`${styles.formRow} ${styles.formRowStart}`}>
            <Label htmlFor="description" className={styles.labelRight}>
              설명
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="일정에 대한 상세 설명을 입력하세요."
              className={`${styles.colSpan3} ${styles.minH100px}`}
            />
          </div>
          <div className={styles.formRow}>
            <Label htmlFor="startDate" className={styles.labelRight}>시작일</Label>
            <Input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={styles.colSpan3} />
          </div>
          <div className={styles.formRow}>
            <Label htmlFor="startTime" className={styles.labelRight}>시작 시간</Label>
            <Input type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={styles.colSpan3} />
          </div>
          <div className={styles.formRow}>
            <Label htmlFor="endDate" className={styles.labelRight}>종료일</Label>
            <Input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={styles.colSpan3} />
          </div>
          <div className={styles.formRow}>
            <Label htmlFor="endTime" className={styles.labelRight}>종료 시간</Label>
            <Input type="time" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={styles.colSpan3} />
          </div>
        </div>
        <DialogFooter className={styles.dialogFooter}>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {event ? "수정" : "추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}