import StudyCard from "./StudyCard";
import styles from './StudyList.module.css';

export default function StudyList({ studies }) {
  return (
    <div className={styles.studyListGrid}>
      {studies.map((study) => (
        <StudyCard key={study.studyId} {...study} />
      ))}
    </div>
  );
}