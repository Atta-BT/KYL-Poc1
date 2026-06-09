import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { Button } from "./Button";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  isOpen: boolean;
  isBusy?: boolean;
  variant?: "danger" | "success" | "confirm";
  hideCancel?: boolean;
  onCancel?: () => void;
  onConfirm: () => void;
};

export const ConfirmDialog = ({
  title,
  message,
  confirmText,
  cancelText = "ยกเลิก",
  isOpen,
  isBusy = false,
  variant = "danger",
  hideCancel = false,
  onCancel,
  onConfirm
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const iconClass =
    variant === "success"
      ? "dialog__icon--success"
      : variant === "confirm"
        ? "dialog__icon--confirm"
        : "";

  const buttonVariant =
    variant === "danger" ? "danger" : "primary";

  const icon =
    variant === "success" ? (
      <CheckCircle2 size={24} />
    ) : variant === "confirm" ? (
      <HelpCircle size={24} />
    ) : (
      <AlertTriangle size={24} />
    );

  return (
    <div className="dialog-backdrop" role="presentation">
      <div
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="dialog"
        role="dialog"
      >
        <div
          className={`dialog__icon ${iconClass}`}
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="dialog__content">
          <h2 id="confirm-dialog-title">{title}</h2>
          <p>{message}</p>
        </div>
        <div className="dialog__actions">
          {!hideCancel && onCancel ? (
            <Button disabled={isBusy} onClick={onCancel} variant="ghost">
              {cancelText}
            </Button>
          ) : null}
          <Button
            disabled={isBusy}
            onClick={onConfirm}
            variant={buttonVariant}
          >
            {isBusy ? "กำลังดำเนินการ..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
