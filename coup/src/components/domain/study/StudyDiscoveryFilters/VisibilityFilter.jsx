import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import styles from './VisibilityFilter.module.css';

function VisibilityFilter() {
  return (
    <div className={styles.filterGroup}>
      <Label>공개 여부</Label>
      <div className={styles.switchGroup}>
        <Switch id="public" label="공개" />
        <Switch id="private" label="비공개" />
      </div>
    </div>
  );
}

export default VisibilityFilter;
