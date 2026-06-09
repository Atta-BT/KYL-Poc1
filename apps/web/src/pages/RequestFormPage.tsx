import {
  ArrowLeft,
  Save,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createRequest,
  deleteRequest,
  getRequest,
  updateRequest
} from "../api";
import { Button, ConfirmDialog, FormField } from "../components";
import {
  REQUEST_TYPES,
  type RequestPayload,
  type ServiceRequest
} from "../types";
import {
  formatDateTime,
  toApiPayload,
  validateRequestPayload,
  type FormErrors
} from "../utils";

const emptyPayload: RequestPayload = {
  title: "",
  requestType: "",
  requesterName: "",
  requesterEmail: "",
  detail: ""
};

const toFormPayload = (request: ServiceRequest): RequestPayload => ({
  title: request.title,
  requestType: request.requestType,
  requesterName: request.requesterName,
  requesterEmail: request.requesterEmail,
  detail: request.detail
});

export const RequestFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [payload, setPayload] = useState<RequestPayload>(emptyPayload);
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setIsLoading(true);
      setPageError(null);

      try {
        const response = await getRequest(id);
        setRequest(response);
        setPayload(toFormPayload(response));
      } catch (caught) {
        setPageError(
          caught instanceof Error
            ? caught.message
            : "ไม่สามารถโหลดข้อมูล Request ได้"
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  const pageTitle = useMemo(
    () => (isEditing ? "แก้ไข Request" : "เพิ่ม Request"),
    [isEditing]
  );

  const handleChange =
    (field: keyof RequestPayload) =>
    (
      event:
        | ChangeEvent<HTMLInputElement>
        | ChangeEvent<HTMLSelectElement>
        | ChangeEvent<HTMLTextAreaElement>
    ) => {
      setPayload((current) => ({
        ...current,
        [field]: event.target.value
      }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    };

  // Step 1: Validate → open confirm popup
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateRequestPayload(payload);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    // Validation passed → show confirmation dialog
    setIsConfirmSaveOpen(true);
  };

  // Step 2: User confirmed → actually save
  const handleConfirmSave = async () => {
    setIsSaving(true);
    setPageError(null);

    try {
      const apiPayload = toApiPayload(payload);

      if (isEditing && id) {
        await updateRequest(id, apiPayload);
      } else {
        await createRequest(apiPayload);
      }

      // Save successful → navigate to main page
      setIsConfirmSaveOpen(false);
      navigate("/", { replace: true });
    } catch (caught) {
      setIsConfirmSaveOpen(false);
      setPageError(
        caught instanceof Error ? caught.message : "ไม่สามารถบันทึกข้อมูลได้"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    setPageError(null);

    try {
      await deleteRequest(id);
      navigate("/", { replace: true });
    } catch (caught) {
      setPageError(
        caught instanceof Error ? caught.message : "ไม่สามารถลบ Request ได้"
      );
      setIsConfirmDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="page-stack">
      <div className="page-title-row">
        <div>
          <Link className="back-link" to="/">
            <ArrowLeft size={18} />
            กลับหน้ารายการ
          </Link>
          <h2>{pageTitle}</h2>
        </div>
        {isEditing && request ? (
          <div className="request-meta">
            <span>{request.requestNo}</span>
            <span>{formatDateTime(request.createdAt)}</span>
          </div>
        ) : null}
      </div>

      <section className="panel">
        {pageError ? <div className="alert alert--error">{pageError}</div> : null}

        {isLoading ? (
          <div className="loading-block">กำลังโหลดข้อมูล Request</div>
        ) : (
          <form className="request-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <FormField
                error={errors.title}
                htmlFor="title"
                label="หัวข้อ Request"
              >
                <input
                  id="title"
                  onChange={handleChange("title")}
                  value={payload.title}
                />
              </FormField>

              <FormField
                error={errors.requestType}
                htmlFor="requestType"
                label="ประเภท Request"
              >
                <select
                  id="requestType"
                  onChange={handleChange("requestType")}
                  value={payload.requestType}
                >
                  <option value="">เลือกประเภท</option>
                  {REQUEST_TYPES.map((requestType) => (
                    <option key={requestType} value={requestType}>
                      {requestType}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                error={errors.requesterName}
                htmlFor="requesterName"
                label="ชื่อผู้ส่งคำขอ"
              >
                <input
                  id="requesterName"
                  onChange={handleChange("requesterName")}
                  value={payload.requesterName}
                />
              </FormField>

              <FormField
                error={errors.requesterEmail}
                htmlFor="requesterEmail"
                label="อีเมลผู้ส่งคำขอ"
              >
                <input
                  id="requesterEmail"
                  onChange={handleChange("requesterEmail")}
                  type="email"
                  value={payload.requesterEmail}
                />
              </FormField>
            </div>

            <FormField
              error={errors.detail}
              htmlFor="detail"
              label="รายละเอียด Request"
            >
              <textarea
                id="detail"
                onChange={handleChange("detail")}
                rows={7}
                value={payload.detail}
              />
            </FormField>

            <div className="form-actions">
              {isEditing ? (
                <Button
                  disabled={isSaving || isDeleting}
                  icon={<Trash2 size={18} />}
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  variant="danger"
                >
                  ลบ
                </Button>
              ) : (
                <span />
              )}
              <div className="form-actions__right">
                <Link className="button button--ghost" to="/">
                  ยกเลิก
                </Link>
                <Button
                  disabled={isSaving || isDeleting}
                  icon={<Save size={18} />}
                  type="submit"
                  variant="primary"
                >
                  {isEditing ? "บันทึกการเปลี่ยนแปลง" : "บันทึก"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </section>

      {/* Confirm save → then navigate to main page */}
      <ConfirmDialog
        confirmText="ยืนยัน"
        isBusy={isSaving}
        isOpen={isConfirmSaveOpen}
        message={
          isEditing
            ? "คุณต้องการบันทึกการเปลี่ยนแปลงนี้หรือไม่?"
            : "คุณต้องการบันทึก Request นี้หรือไม่?"
        }
        onCancel={() => setIsConfirmSaveOpen(false)}
        onConfirm={() => void handleConfirmSave()}
        title="ยืนยันการบันทึก"
        variant="confirm"
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        confirmText="ลบ Request"
        isBusy={isDeleting}
        isOpen={isConfirmDeleteOpen}
        message="รายการนี้จะถูกลบแบบ Soft Delete และบันทึกวันเวลาที่ลบไว้ในฐานข้อมูล"
        onCancel={() => setIsConfirmDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
        title="ยืนยันการลบ"
        variant="danger"
      />
    </section>
  );
};
