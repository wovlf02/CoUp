import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Button } from "../../../ui/button";
import styles from './EventAddEditModal.module.css';
import { useCreateEventMutation, useUpdateEventMutation } from '@/lib/api/mutations/events';
import { toast } from 'react-toastify';

export default function EventAddEditModal({
  isOpen,
  onClose,
  event = null, // If event is provided, it's an edit operation
  studyId, // Added studyId prop
}) {
  const [title, setTitle] = useState(event ? event.title : "");
  const [description, setDescription] = useState(event ? event.description : "");
  const [startDate, setStartDate] = useState(event ? event.startTime.split('T')[0] : "");
  const [startTime, setStartTime] = useState(event ? event.startTime.split('T')[1].substring(0, 5) : "");
  const [endDate, setEndDate] = useState(event ? event.endTime.split('T')[0] : "");
  const [endTime, setEndTime] = useState(event ? event.endTime.split('T')[1].substring(0, 5) : "");

  const createEventMutation = useCreateEventMutation(studyId);
  const updateEventMutation = useUpdateEventMutation(studyId, event?.id);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setStartDate(event.startTime.split('T')[0]);
      setStartTime(event.startTime.split('T')[1].substring(0, 5));
      setEndDate(event.endTime.split('T')[0]);
      setEndTime(event.endTime.split('T')[1].substring(0, 5));
    } else {
      setTitle("");
      setDescription("");
      setStartDate("");
      setStartTime("");
      setEndDate("");
      setEndTime("");
    }
  }, [event]);

  const handleSubmit = async () => {
    if (!title.trim() || !startDate.trim() || !startTime.trim() || !endDate.trim() || !endTime.trim()) {
      toast.error("모든 필수 항목을 입력해주세요.");
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}:00`).toISOString();
    const endDateTime = new Date(`${endDate}T${endTime}:00`).toISOString();

    const eventData = {
      title,
      description: description || null,
      startTime: startDateTime,
      endTime: endDateTime,
    };

    try {
      if (event) {
        await updateEventMutation.mutateAsync(eventData);
        toast.success("일정이 성공적으로 수정되었습니다.");
      } else {
        await createEventMutation.mutateAsync(eventData);
        toast.success("새 일정이 성공적으로 추가되었습니다.");
      }
      onClose();
    } catch (error) {
      console.error("Failed to save event:", error);
      toast.error("일정 저장 실패: " + error.message);
    }
  };

  const isSaving = createEventMutation.isPending || updateEventMutation.isPending;

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
              disabled={isSaving}
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
              disabled={isSaving}
            />
          </div>
          <div className={styles.formRow}>
            <Label htmlFor="startDate" className={styles.labelRight}>시작일</Label>
            <Input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={styles.colSpan3} disabled={isSaving} />
          </div>
          <div className={styles.formRow}>
            <Label htmlFor="startTime" className={styles.labelRight}>시작 시간</Label>
            <Input type="time" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={styles.colSpan3} disabled={isSaving} />
          </div>
          <div className={styles.formRow}>
            <Label htmlFor="endDate" className={styles.labelRight}>종료일</Label>
            <Input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={styles.colSpan3} disabled={isSaving} />
          </div>
          <div className={styles.formRow}>
            <Label htmlFor="endTime" className={styles.labelRight}>종료 시간</Label>
            <Input type="time" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={styles.colSpan3} disabled={isSaving} />
          </div>
        </div>
        <DialogFooter className={styles.dialogFooter}>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            취소
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (event ? "수정 중..." : "추가 중...") : (event ? "수정" : "추가")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}