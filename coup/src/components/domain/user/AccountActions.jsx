import { Button } from "../../ui/button";
import styles from './AccountActions.module.css';

export default function AccountActions({ onSave, onDeleteAccount }) {
  return (
    <div className={styles.accountActionsContainer}>
      <Button variant="destructive" onClick={onDeleteAccount}>
        계정 탈퇴
      </Button>
      <Button variant="primary" onClick={onSave}>
        저장
      </Button>
    </div>
  );
}