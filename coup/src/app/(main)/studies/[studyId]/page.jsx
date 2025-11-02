import StudyOverviewContent from '@/components/domain/study/StudyOverviewContent';

export default function StudyOverviewPage({ params }) {
  const { studyId } = params;

  // Placeholder data for study details
  const studyDetails = {
    goal: "정보처리기사 자격증 취득",
    rules: "매주 3회 온라인 스터디 참여, 주 1회 모의고사 풀이",
    members: [
      { id: '1', name: '김철수', imageUrl: '/next.svg' },
      { id: '2', name: '이영희', imageUrl: '/next.svg' },
      { id: '3', name: '박민수', imageUrl: '/next.svg' },
    ],
  };

  return (
    <StudyOverviewContent
      studyGoal={studyDetails.goal}
      studyRules={studyDetails.rules}
      studyMembers={studyDetails.members}
    />
  );
}
