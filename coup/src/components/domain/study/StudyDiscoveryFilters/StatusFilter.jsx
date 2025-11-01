import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import styles from './StatusFilter.module.css';

function StatusFilter() {
  return (
    <div className={styles.filterGroup}>
      <Label>스터디 상태</Label>
      <div className={styles.checkboxGroup}>
        <Checkbox id="recruiting" label="모집 중" />
        <Checkbox id="inProgress" label="진행 중" />
        <Checkbox id="completed" label="종료" />
      </div>
    </div>
  );
}

export default StatusFilter;
