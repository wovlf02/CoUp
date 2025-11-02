import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import styles from './BioTextarea.module.css';

export default function BioTextarea({ bio, onBioChange }) {
  return (
    <div className={styles.bioTextareaContainer}>
      <Label htmlFor="bio" className={styles.bioLabel}>자기소개</Label>
      <Textarea
        id="bio"
        value={bio}
        onChange={(e) => onBioChange(e.target.value)}
        placeholder="자기소개를 입력하세요."
        rows={5}
      />
    </div>
  );
}