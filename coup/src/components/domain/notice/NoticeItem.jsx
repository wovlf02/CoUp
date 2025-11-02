import React from 'react';
import styles from './NoticeItem.module.css';

export default function NoticeItem({
  noticeId,
  title,
  authorName,
  createdAt,
  onEdit,
  onDelete,
}) {
  // Placeholder for user role check
  const canManage = true; 

  return (
    <div className={styles.noticeItemContainer}>
      <h3 className={styles.noticeTitle}>{title}</h3>
      <div className={styles.noticeMeta}>
        <span className={styles.author}>작성자: {authorName}</span>
        <span className={styles.date}>{createdAt}</span>
      </div>
      {canManage && (
        <div className={styles.actionButtons}>
          <button onClick={() => onEdit(noticeId)} className={styles.editButton}>수정</button>
          <button onClick={() => onDelete(noticeId)} className={styles.deleteButton}>삭제</button>
        </div>
      )}
    </div>
  );
}
