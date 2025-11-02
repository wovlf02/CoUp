import React from 'react';
import NoticeItem from './NoticeItem';
import styles from './NoticeList.module.css';

export default function NoticeList({ studyId, notices, onEdit, onDelete }) {
  // Placeholder notices if not provided
  const defaultNotices = [
    {
      noticeId: '1',
      title: '첫 번째 공지사항입니다.',
      authorName: '관리자',
      createdAt: '2025.10.20',
    },
    {
      noticeId: '2',
      title: '주간 스터디 계획 변경 안내',
      authorName: '김철수',
      createdAt: '2025.10.25',
    },
  ];

  const noticesToDisplay = notices || defaultNotices;

  return (
    <div className={styles.noticeListContainer}>
      {noticesToDisplay.length > 0 ? (
        noticesToDisplay.map((notice) => (
          <NoticeItem
            key={notice.noticeId}
            noticeId={notice.noticeId}
            title={notice.title}
            authorName={notice.authorName}
            createdAt={notice.createdAt}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      ) : (
        <p className={styles.emptyMessage}>등록된 공지사항이 없습니다.</p>
      )}
    </div>
  );
}
