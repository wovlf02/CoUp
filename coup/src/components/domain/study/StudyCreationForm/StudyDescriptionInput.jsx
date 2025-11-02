import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import styles from './StudyDescriptionInput.module.css';

export default function StudyDescriptionInput({ value, onChange, error }) {
  return (
    <div className={styles.formGroup}>
      <Label htmlFor="studyDescription">스터디 소개</Label>
      <Textarea
        id="studyDescription"
        value={value}
        onChange={onChange}
        placeholder="스터디를 소개해주세요. (Markdown 지원)"
        rows={5}
      />
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
