import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import styles from './StudyNameInput.module.css';

export default function StudyNameInput({ value, onChange, error }) {
  return (
    <div className={styles.formGroup}>
      <Label htmlFor="studyName">스터디 이름</Label>
      <Input
        id="studyName"
        type="text"
        value={value}
        onChange={onChange}
        placeholder="스터디 이름을 입력하세요."
      />
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
