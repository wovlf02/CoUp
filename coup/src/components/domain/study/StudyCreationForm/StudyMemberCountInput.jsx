import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import styles from './StudyMemberCountInput.module.css';

export default function StudyMemberCountInput({ value, onChange, error }) {
  return (
    <div className={styles.formGroup}>
      <Label htmlFor="maxMembers">모집 인원 (최대)</Label>
      <Input
        id="maxMembers"
        type="number"
        value={value}
        onChange={onChange}
        placeholder="최대 인원을 입력하세요 (예: 10)"
        min="1"
      />
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
