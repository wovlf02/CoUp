import Image from "next/image";
import { Card } from "../../ui/card";
import styles from './StudyHeader.module.css';

export default function StudyHeader({ studyName, studyDescription, studyLogoUrl }) {
  return (
    <Card className={styles.studyHeaderCard}>
      <Image
        src={studyLogoUrl || "/next.svg"} // Placeholder
        alt={studyName}
        width={64}
        height={64}
        className={styles.studyLogo}
      />
      <div>
        <h1 className={styles.studyName}>{studyName}</h1>
        <p className={styles.studyDescription}>{studyDescription}</p>
      </div>
    </Card>
  );
}