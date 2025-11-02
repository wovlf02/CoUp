import Image from "next/image";
import Link from "next/link";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import styles from './StudyCard.module.css';

export default function StudyCard({
  studyId,
  imageUrl,
  name,
  description,
  category,
  currentMembers,
  maxMembers,
  ownerName,
  ownerImageUrl,
  createdAt,
}) {
  return (
    <Link href={`/studies/${studyId}`} className={styles.studyCardLink}>
      <Card className={`${styles.studyCard} ${styles.hoverEffect}`}>
        <div className={styles.imageContainer}>
          <Image
            src={imageUrl || "/next.svg"} // Placeholder image
            alt={name}
            fill
            className={styles.studyImage}
          />
        </div>
        <div className={styles.cardContent}>
          <h3 className={styles.studyName}>{name}</h3>
          <p className={styles.studyDescription}>{description}</p>
          <div className={styles.badgeContainer}>
            <Badge variant="secondary">{category}</Badge>
            <Badge variant="outline">{`${currentMembers}/${maxMembers}명`}</Badge>
          </div>
          <div className={styles.ownerInfo}>
            <Image
              src={ownerImageUrl || "/next.svg"} // Placeholder for owner image
              alt={ownerName}
              width={24}
              height={24}
              className={styles.ownerImage}
            />
            <span>{ownerName}</span>
            <span className={styles.createdAt}>{createdAt}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}