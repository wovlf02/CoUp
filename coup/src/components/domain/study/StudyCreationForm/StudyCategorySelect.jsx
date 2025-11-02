import React from 'react';
import { Label } from '@/components/ui/label';
import styles from './StudyCategorySelect.module.css';

export default function StudyCategorySelect({ value, onChange, error }) {
  const categories = [
    { value: '', label: '카테고리 선택' },
    { value: 'programming', label: '프로그래밍' },
    { value: 'language', label: '어학' },
    { value: 'certificate', label: '자격증' },
    { value: 'exam', label: '고시/공무원' },
    { value: 'etc', label: '기타' },
  ];

  return (
    <div className={styles.formGroup}>
      <Label htmlFor="studyCategory">카테고리</Label>
      <select
        id="studyCategory"
        value={value}
        onChange={onChange}
        className={styles.selectInput}
      >
        {categories.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
