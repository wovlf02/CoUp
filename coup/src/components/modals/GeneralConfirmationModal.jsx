import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import styles from './GeneralConfirmationModal.module.css';

export default function GeneralConfirmationModal({
  isOpen,
  onClose,
  title = "확인",
  message,
  onConfirm,
  confirmText = "확인",
  cancelText = "취소",
  confirmVariant = "primary",
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className={styles.messageContainer}>
          <p className={styles.messageText}>{message}</p>
        </div>
        <DialogFooter className={styles.dialogFooter}>
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}