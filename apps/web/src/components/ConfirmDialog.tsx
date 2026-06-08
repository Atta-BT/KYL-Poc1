import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  isOpen: boolean;
  isBusy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmDialog = ({
  title,
  message,
  confirmText,
  cancelText = "ยกเลิก",
  isOpen,
  isBusy = false,
  onCancel,
  onConfirm
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop" role="presentation">
      <div
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="dialog"
        role="dialog"
      >
        <div className="dialog__icon" aria-hidden="true">
          <AlertTriangle size={24} />
        </div>
        <div className="dialog__content">
          <h2 id="confirm-dialog-title">{title}</h2>
          <p>{message}</p>
        </div>
        <div className="dialog__actions">
          <Button disabled={isBusy} onClick={onCancel} variant="ghost">
            {cancelText}
          </Button>
          <Button disabled={isBusy} onClick={onConfirm} variant="danger">
            {isBusy ? "กำลังลบ" : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

