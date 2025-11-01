import React from 'react';
import CategoryFilter from './CategoryFilter';
import StatusFilter from './StatusFilter';
import VisibilityFilter from './VisibilityFilter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import styles from './StudyDiscoveryFilters.module.css';

function StudyDiscoveryFilters() {
  return (
    <Card className={styles.filtersCard}>
      <CardHeader>
        <CardTitle>필터</CardTitle>
      </CardHeader>
      <CardContent className={styles.filtersContent}>
        <CategoryFilter />
        <StatusFilter />
        <VisibilityFilter />
        {/* Add more filters as needed */}
      </CardContent>
    </Card>
  );
}

export default StudyDiscoveryFilters;
