import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import styles from './NicknameInput.module.css';

export default function NicknameInput({ nickname, onNicknameChange, error }) {
  return (
    <div className={styles.nicknameInputContainer}>
      <Label htmlFor="nickname" className={styles.nicknameLabel}>닉네임</Label>
      <Input
        id="nickname"
        type="text"
        value={nickname}
        onChange={(e) => onNicknameChange(e.target.value)}
        placeholder="닉네임을 입력하세요."
      />
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}