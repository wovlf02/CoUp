import React from 'react';
import StudyCard from './StudyCard';
import styles from './StudyList.module.css';

function StudyList() {
  // Mock data for now
  const studies = [
    { id: '1', name: '알고리즘 스터디', description: '코딩 테스트 준비를 위한 알고리즘 스터디입니다.', category: '프로그래밍', members: '5/10명', owner: '김민준', createdAt: '2025.10.28', imageUrl: '/next.svg' },
    { id: '2', name: '리액트 프로젝트', description: '리액트 기반 프로젝트를 함께 만들어갈 스터디원 모집합니다.', category: '프로그래밍', members: '8/10명', owner: '이서아', createdAt: '2025.10.27', imageUrl: '/next.svg' },
    { id: '3', name: '토익 900점 달성', description: '토익 고득점을 목표로 하는 스터디입니다.', category: '어학', members: '3/5명', owner: '박선영', createdAt: '2025.10.26', imageUrl: '/file.svg' },
    { id: '4', name: '자바스크립트 딥다이브', description: '자바스크립트 핵심 개념을 깊이 있게 파고드는 스터디입니다.', category: '프로그래밍', members: '7/7명', owner: '최지훈', createdAt: '2025.10.25', imageUrl: '/next.svg' },
  ];

  return (
    <div className={styles.studyListGrid}>
      {studies.map(study => (
        <StudyCard key={study.id} study={study} />
      ))}
    </div>
  );
}

export default StudyList;
