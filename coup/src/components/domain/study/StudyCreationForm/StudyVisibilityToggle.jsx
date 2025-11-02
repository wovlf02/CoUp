import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import styles from './StudyVisibilityToggle.module.css';

export default function StudyVisibilityToggle({ value, onChange, error }) {
  return (
    <div className={styles.formGroup}>
      <Label>공개 여부</Label>
      <div className={styles.toggleGroup}>
        <Switch
          id="visibilityPublic"
          checked={value === 'PUBLIC'}
          onCheckedChange={() => onChange('PUBLIC')}
          label="공개"
        />
        <Switch
          id="visibilityPrivate"
          checked={value === 'PRIVATE'}
          onCheckedChange={() => onChange('PRIVATE')}
          label="비공개"
        />
      </div>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}
