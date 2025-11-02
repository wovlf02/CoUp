import Image from "next/image";
import { Button } from "../../ui/button";
import styles from './ProfileImageSection.module.css';

export default function ProfileImageSection({ imageUrl, onImageChange }) {
  return (
    <div className={styles.profileImageSectionContainer}>
      <div className={styles.imageWrapper}>
        <Image
          src={imageUrl || "/next.svg"} // Placeholder
          alt="Profile Image"
          fill
          className={styles.profileImage}
        />
      </div>
      <Button variant="outline" onClick={onImageChange}>
        변경
      </Button>
    </div>
  );
}