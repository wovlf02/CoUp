import React from 'react';
import FileList from '@/components/domain/file/FileList';
import FileUploadArea from '@/components/domain/file/FileUploadArea';
import styles from './files.module.css';

export default function StudyFilesPage({ params }) {
  const { studyId } = params;

  return (
    <div className={styles.filesPageContainer}>
      <h1 className={styles.pageTitle}>파일 공유</h1>
      <FileUploadArea studyId={studyId} />
      <FileList studyId={studyId} />
    </div>
  );
}
