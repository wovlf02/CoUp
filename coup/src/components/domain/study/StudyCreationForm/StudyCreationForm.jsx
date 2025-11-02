import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StudyNameInput from './StudyNameInput';
import StudyDescriptionInput from './StudyDescriptionInput';
import StudyCategorySelect from './StudyCategorySelect';
import StudyVisibilityToggle from './StudyVisibilityToggle';
import StudyMemberCountInput from './StudyMemberCountInput';
import styles from './StudyCreationForm.module.css';

export default function StudyCreationForm() {
  const [studyName, setStudyName] = useState('');
  const [studyDescription, setStudyDescription] = useState('');
  const [studyGoal, setStudyGoal] = useState('');
  const [studyCategory, setStudyCategory] = useState('');
  const [studyRules, setStudyRules] = useState('');
  const [studyVisibility, setStudyVisibility] = useState('PUBLIC');
  const [maxMembers, setMaxMembers] = useState(10);

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!studyName.trim()) newErrors.studyName = '스터디 이름을 입력해주세요.';
    if (!studyDescription.trim()) newErrors.studyDescription = '스터디 소개를 입력해주세요.';
    if (!studyCategory) newErrors.studyCategory = '카테고리를 선택해주세요.';
    if (!maxMembers || maxMembers < 1) newErrors.maxMembers = '모집 인원은 1명 이상이어야 합니다.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const newStudy = {
        name: studyName,
        description: studyDescription,
        goal: studyGoal,
        category: studyCategory,
        rules: studyRules,
        visibility: studyVisibility,
        maxMembers: parseInt(maxMembers),
      };
      console.log('New Study Data:', newStudy);
      alert('스터디가 성공적으로 생성되었습니다! (실제 API 호출 필요)');
      // TODO: Call API to create study
    }
  };

  return (
    <Card className={styles.studyCreationCard}>
      <CardContent className={styles.cardContent}>
        <form onSubmit={handleSubmit} className={styles.formLayout}>
          <StudyNameInput
            value={studyName}
            onChange={(e) => setStudyName(e.target.value)}
            error={errors.studyName}
          />
          <StudyDescriptionInput
            value={studyDescription}
            onChange={(e) => setStudyDescription(e.target.value)}
            error={errors.studyDescription}
          />
          <div className={styles.formGroup}>
            <Label htmlFor="studyGoal">스터디 목표</Label>
            <Input
              id="studyGoal"
              type="text"
              value={studyGoal}
              onChange={(e) => setStudyGoal(e.target.value)}
              placeholder="스터디 목표를 입력하세요."
            />
          </div>
          <StudyCategorySelect
            value={studyCategory}
            onChange={(e) => setStudyCategory(e.target.value)}
            error={errors.studyCategory}
          />
          <div className={styles.formGroup}>
            <Label htmlFor="studyRules">스터디 규칙</Label>
            <Textarea
              id="studyRules"
              value={studyRules}
              onChange={(e) => setStudyRules(e.target.value)}
              placeholder="스터디 규칙을 입력하세요."
              rows={3}
            />
          </div>
          <StudyVisibilityToggle
            value={studyVisibility}
            onChange={setStudyVisibility}
            error={errors.studyVisibility}
          />
          <StudyMemberCountInput
            value={maxMembers}
            onChange={(e) => setMaxMembers(e.target.value)}
            error={errors.maxMembers}
          />
          <div className={styles.buttonGroup}>
            <Button type="button" variant="outline" onClick={() => console.log('취소')}>취소</Button>
            <Button type="submit" variant="primary">스터디 생성</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
