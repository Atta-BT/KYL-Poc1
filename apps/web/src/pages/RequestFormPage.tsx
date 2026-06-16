import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  createRequest,
  deleteRequest,
  getRequest,
  updateRequest
} from "../api";
import { Button, ConfirmDialog, FormField } from "../components";
import { getServiceForm } from "../features/requests/serviceForms";
import {
  REQUEST_TYPES,
  type RequestPayload,
  type RequestType,
  type ServiceRequest
} from "../types";
import {
  formatDateTime,
  toApiPayload,
  validateRequestPayload
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

const PRESELECT_TYPES: Record<string, RequestType> = {
  ithenticate: "บริการตรวจการคัดลอกผลงาน (iThenticate)",
  fulltext: "บริการ Find Fulltext 4U",
  bookdelivery: "บริการนำส่งหนังสือ (Book Delivery)",
  interlibraryloan: "บริการยืมระหว่างห้องสมุด",
  publishdelivery: "บริการนำส่งเผยแพร่ผลงาน หนังสือ ตำรา",
};

export const RequestFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [payload, setPayload] = useState<RequestPayload>(emptyPayload);
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);

  // Value for the currently selected service form (shape owned by its module).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [serviceValue, setServiceValue] = useState<any>(null);

  const location = useLocation();

  const userJson = sessionStorage.getItem("kyl-user");
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    if (!id) {
      const searchParams = new URLSearchParams(location.search);
      const preselectedType = searchParams.get("type");
      const resolvedType = preselectedType
        ? PRESELECT_TYPES[preselectedType]
        : undefined;

      setPayload((current) => ({
        ...current,
        requestType: resolvedType || current.requestType,
        requesterName: user?.fullName || current.requesterName,
        requesterEmail: user?.email || current.requesterEmail
      }));

      const module = getServiceForm(resolvedType || "");
      setServiceValue(module ? module.emptyValue : null);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setPageError(null);

      try {
        const response = await getRequest(id);

        if (user && (user.role === "student" || user.role === "staff")) {
          if (response.requesterEmail !== user.email) {
            setPageError("คุณไม่มีสิทธิ์เข้าถึงหรือแก้ไข Request นี้");
            setIsLoading(false);
            return;
          }
        }

        setRequest(response);
        setPayload(toFormPayload(response));

        const module = getServiceForm(response.requestType);
        setServiceValue(module ? module.fromRequest(response) : null);
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

  const activeModule = getServiceForm(payload.requestType);

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

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value as RequestType | "";
    setPayload((current) => ({ ...current, requestType: newType }));
    setErrors((current) => ({ ...current, requestType: undefined }));

    const module = getServiceForm(newType);
    setServiceValue(module ? module.emptyValue : null);
  };

  const clearError = (field: string) =>
    setErrors((current) => ({ ...current, [field]: undefined }));

  // Step 1: Validate → open confirm popup
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let combinedErrors: Record<string, string | undefined> = {};
    if (activeModule) {
      // Detail is constructed on save, so bypass its check here.
      const commonErrors = validateRequestPayload({
        ...payload,
        detail: "placeholder"
      });
      combinedErrors = { ...commonErrors, ...activeModule.validate(serviceValue) };
    } else {
      combinedErrors = validateRequestPayload(payload);
    }

    setErrors(combinedErrors);

    const hasErrors = Object.values(combinedErrors).some(Boolean);
    if (hasErrors) return;

    setIsConfirmSaveOpen(true);
  };

  // Step 2: User confirmed → actually save
  const handleConfirmSave = async () => {
    setIsSaving(true);
    setPageError(null);

    try {
      let finalDetail = payload.detail;
      let extraPayload: Partial<RequestPayload> = {};

      if (activeModule) {
        const built = activeModule.buildPayload(serviceValue);
        finalDetail = built.detail;
        extraPayload = built.extra;
      }

      const apiPayload = toApiPayload({
        ...payload,
        detail: finalDetail,
        ...extraPayload
      });

      if (isEditing && id) {
        await updateRequest(id, apiPayload);
      } else {
        await createRequest(apiPayload);
      }

      setIsConfirmSaveOpen(false);
      navigate("/requests", { replace: true });
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
      navigate("/requests", { replace: true });
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
          <Link className="back-link" to="/requests">
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
        ) : pageError && !request ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              คุณไม่มีสิทธิ์เข้าถึงหรือแก้ไขข้อมูลรายการนี้
            </p>
            <Link className="button button--primary" to="/">
              กลับหน้าหลัก
            </Link>
          </div>
        ) : (
          <form className="request-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <FormField error={errors.title} htmlFor="title" label="หัวข้อ Request">
                <input id="title" onChange={handleChange("title")} value={payload.title} />
              </FormField>

              <FormField
                error={errors.requestType}
                htmlFor="requestType"
                label="ประเภท Request"
              >
                <select
                  id="requestType"
                  onChange={handleTypeChange}
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

            {activeModule && serviceValue !== null ? (
              <activeModule.Form
                value={serviceValue}
                onChange={setServiceValue}
                errors={errors}
                clearError={clearError}
              />
            ) : (
              <FormField error={errors.detail} htmlFor="detail" label="รายละเอียด Request">
                <textarea
                  id="detail"
                  onChange={handleChange("detail")}
                  rows={7}
                  value={payload.detail}
                />
              </FormField>
            )}

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
                <Link className="button button--ghost" to="/requests">
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
