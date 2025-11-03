'use client';

import StudyDiscoveryFilters from "../../../components/domain/study/StudyDiscoveryFilters";
import StudyList from "../../../components/domain/study/StudyList";
import styles from './studies.module.css';

export default function StudiesPage() {
  // Placeholder data for studies
  const studies = [
    {
      studyId: "1",
      imageUrl: "/next.svg",
      name: "Next.js 스터디",
      description: "Next.js 14를 활용한 웹 개발 스터디입니다.",
      category: "프로그래밍",
      currentMembers: 5,
      maxMembers: 10,
      ownerName: "김철수",
      ownerImageUrl: "/next.svg",
      createdAt: "2025.10.28",
    },
    {
      studyId: "2",
      imageUrl: "/next.svg",
      name: "영어 회화 스터디",
      description: "매일 영어 회화 연습을 통해 실력을 향상시킵니다.",
      category: "어학",
      currentMembers: 8,
      maxMembers: 10,
      ownerName: "이영희",
      ownerImageUrl: "/next.svg",
      createdAt: "2025.10.29",
    },
    {
      studyId: "3",
      imageUrl: "/next.svg",
      name: "정보처리기사 스터디",
      description: "정보처리기사 자격증 취득을 위한 스터디입니다.",
      category: "자격증",
      currentMembers: 3,
      maxMembers: 5,
      ownerName: "박민수",
      ownerImageUrl: "/next.svg",
      createdAt: "2025.10.30",
    },
  ];

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.filtersColumn}>
        <StudyDiscoveryFilters />
      </div>
      <div className={styles.listColumn}>
        <h1 className={styles.pageTitle}>스터디 탐색</h1>
        <StudyList studies={studies} />
      </div>
    </div>
  );
}