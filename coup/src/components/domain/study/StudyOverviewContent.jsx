import React from 'react';
import StudyGoalCard from './StudyGoalCard';
import StudyRulesCard from './StudyRulesCard';
import StudyMembersPreview from './StudyMembersPreview';
import { Card } from '@/components/ui/card';
import styles from './StudyOverviewContent.module.css';

export default function StudyOverviewContent({
  studyGoal,
  studyRules,
  studyMembers,
}) {
  return (
    <div className={styles.overviewContentContainer}>
      <StudyGoalCard goal={studyGoal} />
      <StudyRulesCard rules={studyRules} />
      <StudyMembersPreview members={studyMembers} />
      {/* Add more overview sections as needed */}
    </div>
  );
}
