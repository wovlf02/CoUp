import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Using Input as a placeholder for a select/dropdown
import styles from './CategoryFilter.module.css';

function CategoryFilter() {
  return (
    <div className={styles.filterGroup}>
      <Label htmlFor="category">카테고리</Label>
      <Input id="category" type="text" placeholder="전체 카테고리" /> {/* This should ideally be a Select component */}
    </div>
  );
}

export default CategoryFilter;
