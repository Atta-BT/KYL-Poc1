import {
  ArrowLeft,
  Save,
  Trash2
} from "lucide-react";
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
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);

  // iThenticate conditional states
  const [status, setStatus] = useState<string>("");
  const [faculty, setFaculty] = useState<string>("");
  const [facultyOther, setFacultyOther] = useState<string>("");
  const [telephone, setTelephone] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [exclusionFilters, setExclusionFilters] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [wantAiReport, setWantAiReport] = useState<string>("");

  // Find Full-text 4U conditional states
  const [ftStatus, setFtStatus] = useState<string>("");
  const [ftFaculty, setFtFaculty] = useState<string>("");
  const [ftTelephone, setFtTelephone] = useState<string>("");
  const [ftArticleTitle, setFtArticleTitle] = useState<string>("");
  const [ftDoi, setFtDoi] = useState<string>("");
  const [ftMoreInfo, setFtMoreInfo] = useState<string>("");
  const [ftPurchaseConsent, setFtPurchaseConsent] = useState<string>("");

  // Book Delivery conditional states
  const [delId, setDelId] = useState<string>("");
  const [delStatus, setDelStatus] = useState<string>("");
  const [delFaculty, setDelFaculty] = useState<string>("");
  const [delBookTitle, setDelBookTitle] = useState<string>("");
  const [delLcCall, setDelLcCall] = useState<string>("");
  const [delCollection, setDelCollection] = useState<string>("");

  const location = useLocation();

  const userJson = sessionStorage.getItem("kyl-user");
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    if (user && user.role === "user") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === "user") return;

    if (!id) {
      const searchParams = new URLSearchParams(location.search);
      const preselectedType = searchParams.get("type");
      let resolvedType = "";
      if (preselectedType === "ithenticate") {
        resolvedType = "บริการตรวจการคัดลอกผลงาน (iThenticate)";
      } else if (preselectedType === "fulltext") {
        resolvedType = "บริการ Find Fulltext 4U";
      } else if (preselectedType === "bookdelivery") {
        resolvedType = "บริการนำส่งหนังสือ (Book Delivery)";
      }

      setPayload((current) => ({
        ...current,
        requestType: (resolvedType || current.requestType) as any,
        requesterName: user?.fullName || current.requesterName,
        requesterEmail: user?.email || current.requesterEmail
      }));
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

        if (response.requestType === "บริการตรวจการคัดลอกผลงาน (iThenticate)") {
          setStatus(response.ithenticateStatus || "");
          setFaculty(response.ithenticateFaculty || "");
          setFacultyOther(response.ithenticateFacultyOther || "");
          setTelephone(response.ithenticateTelephone || "");
          setSelectedFiles(response.ithenticateFiles || []);
          setExclusionFilters(response.ithenticateExclusionFilters || []);
          setAdditionalNotes(response.detail || "");
          setWantAiReport(response.ithenticateWantAiReport || "");
        } else if (response.requestType === "บริการ Find Fulltext 4U") {
          setFtStatus(response.fulltextStatus || "");
          setFtFaculty(response.fulltextFaculty || "");
          setFtTelephone(response.fulltextTelephone || "");
          setFtArticleTitle(response.fulltextArticleTitle || "");
          setFtDoi(response.fulltextDoi || "");
          setFtMoreInfo(response.fulltextMoreInfo || "");
          setFtPurchaseConsent(response.fulltextPurchaseConsent || "");
        } else if (response.requestType === "บริการนำส่งหนังสือ (Book Delivery)") {
          setDelId(response.deliveryStaffStudentId || "");
          setDelStatus(response.deliveryStatus || "");
          setDelFaculty(response.deliveryFaculty || "");
          setDelBookTitle(response.deliveryBookTitle || "");
          setDelLcCall(response.deliveryLcCall || "");
          setDelCollection(response.deliveryCollection || "");
        }
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

    let combinedErrors: Record<string, string> = {};
    if (payload.requestType === "บริการตรวจการคัดลอกผลงาน (iThenticate)") {
      if (!status) combinedErrors.status = "กรุณาเลือกสถานภาพ";
      if (!telephone.trim()) combinedErrors.telephone = "กรุณากรอกเบอร์โทรศัพท์ติดต่อกลับ";
      if (selectedFiles.length === 0) combinedErrors.files = "กรุณาอัปโหลดไฟล์เอกสารอย่างน้อย 1 ไฟล์";
      if (!wantAiReport) combinedErrors.wantAiReport = "กรุณาเลือกความต้องการรายงานผลตรวจจาก AI";

      const commonErrors = validateRequestPayload({
        ...payload,
        detail: "placeholder" // bypass detail check since we will construct it on save
      });
      combinedErrors = { ...commonErrors, ...combinedErrors } as Record<string, string>;
    } else if (payload.requestType === "บริการ Find Fulltext 4U") {
      if (!ftStatus) combinedErrors.ftStatus = "กรุณาเลือกสถานะ";
      if (!ftFaculty) combinedErrors.ftFaculty = "กรุณาเลือกคณะ";
      if (!ftArticleTitle.trim()) combinedErrors.ftArticleTitle = "กรุณากรอกชื่อบทความ";
      if (!ftDoi.trim()) combinedErrors.ftDoi = "กรุณากรอก DOI";
      if (!ftPurchaseConsent) combinedErrors.ftPurchaseConsent = "กรุณาเลือกความต้องการจัดซื้อ";

      const commonErrors = validateRequestPayload({
        ...payload,
        detail: "placeholder" // bypass detail check
      });
      combinedErrors = { ...commonErrors, ...combinedErrors } as Record<string, string>;
    } else if (payload.requestType === "บริการนำส่งหนังสือ (Book Delivery)") {
      if (!delId.trim()) combinedErrors.delId = "กรุณากรอกรหัสนักศึกษา/พนักงาน";
      if (!delStatus) combinedErrors.delStatus = "กรุณาเลือกสถานภาพ";
      if (!delFaculty) combinedErrors.delFaculty = "กรุณาเลือกคณะ";
      if (!delBookTitle.trim()) combinedErrors.delBookTitle = "กรุณากรอกชื่อหนังสือ";
      if (!delLcCall.trim()) combinedErrors.delLcCall = "กรุณากรอก LC Call Number";
      if (!delCollection) combinedErrors.delCollection = "กรุณาเลือก Collection";

      const commonErrors = validateRequestPayload({
        ...payload,
        detail: "placeholder" // bypass detail check
      });
      combinedErrors = { ...commonErrors, ...combinedErrors } as Record<string, string>;
    } else {
      combinedErrors = validateRequestPayload(payload) as Record<string, string>;
    }

    setErrors(combinedErrors);

    if (Object.keys(combinedErrors).length > 0) return;

    // Validation passed → show confirmation dialog
    setIsConfirmSaveOpen(true);
  };

  // Step 2: User confirmed → actually save
  const handleConfirmSave = async () => {
    setIsSaving(true);
    setPageError(null);

    try {
      let finalDetail = payload.detail;
      let extraPayload: Partial<RequestPayload> = {};

      if (payload.requestType === "บริการตรวจการคัดลอกผลงาน (iThenticate)") {
        finalDetail = additionalNotes.trim() || "-";
        extraPayload = {
          ithenticateStatus: status,
          ithenticateFaculty: faculty || null,
          ithenticateFacultyOther: facultyOther || null,
          ithenticateTelephone: telephone,
          ithenticateFiles: selectedFiles,
          ithenticateExclusionFilters: exclusionFilters,
          ithenticateWantAiReport: wantAiReport
        };
      } else if (payload.requestType === "บริการ Find Fulltext 4U") {
        finalDetail = ftMoreInfo.trim() || "-";
        extraPayload = {
          fulltextStatus: ftStatus,
          fulltextFaculty: ftFaculty,
          fulltextTelephone: ftTelephone || null,
          fulltextArticleTitle: ftArticleTitle,
          fulltextDoi: ftDoi,
          fulltextMoreInfo: ftMoreInfo || null,
          fulltextPurchaseConsent: ftPurchaseConsent
        };
      } else if (payload.requestType === "บริการนำส่งหนังสือ (Book Delivery)") {
        finalDetail = `Book Title: ${delBookTitle}, Call Number: ${delLcCall}`;
        extraPayload = {
          deliveryStaffStudentId: delId,
          deliveryStatus: delStatus,
          deliveryFaculty: delFaculty,
          deliveryBookTitle: delBookTitle,
          deliveryLcCall: delLcCall,
          deliveryCollection: delCollection
        };
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

      // Save successful → navigate to main page
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

  if (user && user.role === "user") {
    return null;
  }

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
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>คุณไม่มีสิทธิ์เข้าถึงหรือแก้ไขข้อมูลรายการนี้</p>
            <Link className="button button--primary" to="/">กลับหน้าหลัก</Link>
          </div>
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

            {payload.requestType === "บริการตรวจการคัดลอกผลงาน (iThenticate)" ? (
              <>
                <div className="form-grid" style={{ marginTop: "18px" }}>
                  <FormField
                    error={errors.status}
                    htmlFor="status"
                    label="สถานภาพ (Status) *"
                  >
                    <div className="radio-group" id="status">
                      {[
                        { value: "อาจารย์ (Faculty Member)", label: "1. อาจารย์ (Faculty Member)" },
                        { value: "บุคลากรสายสนับสนุน (Support Staff)", label: "2. บุคลากรสายสนับสนุน (Support Staff)" },
                        { value: "นักศึกษาระดับบัณฑิตศึกษา (Graduate Student)", label: "3. นักศึกษาระดับบัณฑิตศึกษา (Graduate Student)" },
                        { value: "นักศึกษาระดับปริญญาตรี (Undergraduate Student)", label: "4. นักศึกษาระดับปริญญาตรี (Undergraduate Student)" },
                      ].map((opt) => (
                        <label key={opt.value} className="radio-label">
                          <input
                            type="radio"
                            name="status"
                            value={opt.value}
                            checked={status === opt.value}
                            onChange={(e) => {
                              setStatus(e.target.value);
                              setErrors((current) => ({ ...current, status: "" }));
                            }}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </FormField>

                  <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    <FormField
                      error={errors.faculty}
                      htmlFor="faculty"
                      label="คณะ/หน่วยงานที่สังกัด (Faculty/Affiliated Department)"
                    >
                      <select
                        id="faculty"
                        value={faculty}
                        onChange={(e) => {
                          setFaculty(e.target.value);
                          if (e.target.value !== "อื่นๆ (โปรดระบุ)") {
                            setFacultyOther("");
                          }
                        }}
                      >
                        <option value="">เลือกคณะ/หน่วยงาน</option>
                        <option value="คณะแพทยศาสตร์ (Faculty of Medicine)">1. คณะแพทยศาสตร์ (Faculty of Medicine)</option>
                        <option value="คณะทันตแพทยศาสตร์ (Faculty of Dentistry)">2. คณะทันตแพทยศาสตร์ (Faculty of Dentistry)</option>
                        <option value="คณะเภสัชศาสตร์ (Faculty of Pharmaceutical Sciences)">3. คณะเภสัชศาสตร์ (Faculty of Pharmaceutical Sciences)</option>
                        <option value="คณะพยาบาลศาสตร์ (Faculty of Nursing)">4. คณะพยาบาลศาสตร์ (Faculty of Nursing)</option>
                        <option value="คณะวิทยาศาสตร์ (Faculty of Science)">5. คณะวิทยาศาสตร์ (Faculty of Science)</option>
                        <option value="คณะวิศวกรรมศาสตร์ (Faculty of Engineering)">6. คณะวิศวกรรมศาสตร์ (Faculty of Engineering)</option>
                        <option value="คณะวิทยาการจัดการ (Faculty of Management Sciences)">7. คณะวิทยาการจัดการ (Faculty of Management Sciences)</option>
                        <option value="คณะศิลปศาสตร์ (Faculty of Liberal Arts)">8. คณะศิลปศาสตร์ (Faculty of Liberal Arts)</option>
                        <option value="คณะทรัพยากรธรรมชาติ (Faculty of Natural Resources)">9. คณะทรัพยากรธรรมชาติ (Faculty of Natural Resources)</option>
                        <option value="คณะอุตสาหกรรมเกษตร (Faculty of Agro-Industry)">10. คณะอุตสาหกรรมเกษตร (Faculty of Agro-Industry)</option>
                        <option value="คณะการแพทย์แผนไทย (Faculty of Traditional Thai Medicine)">11. คณะการแพทย์แผนไทย (Faculty of Traditional Thai Medicine)</option>
                        <option value="อื่นๆ (โปรดระบุ)">อื่นๆ (โปรดระบุ)</option>
                      </select>
                    </FormField>

                    {faculty === "อื่นๆ (โปรดระบุ)" && (
                      <FormField
                        error={errors.facultyOther}
                        htmlFor="facultyOther"
                        label="คณะอื่น ๆ (โปรดระบุ) Other Faculties (please specify)"
                      >
                        <input
                          id="facultyOther"
                          type="text"
                          placeholder="ระบุคณะ/หน่วยงานของคุณ"
                          value={facultyOther}
                          onChange={(e) => setFacultyOther(e.target.value)}
                        />
                      </FormField>
                    )}

                    <FormField
                      error={errors.telephone}
                      htmlFor="telephone"
                      label="เบอร์โทรศัพท์ติดต่อกลับ (Telephone Number) *"
                    >
                      <input
                        id="telephone"
                        type="tel"
                        placeholder="เช่น 081-234-5678"
                        value={telephone}
                        onChange={(e) => {
                          setTelephone(e.target.value);
                          setErrors((current) => ({ ...current, telephone: "" }));
                        }}
                      />
                    </FormField>
                  </div>
                </div>

                <div style={{ marginTop: "18px" }}>
                  <FormField
                    error={errors.files}
                    htmlFor="files-upload"
                    label="ไฟล์เอกสารที่ต้องการให้ตรวจสอบ (Document files) *"
                  >
                    <div className="file-upload-container">
                      <input
                        id="files-upload"
                        type="file"
                        multiple
                        accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,image/*,video/*,audio/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          if (e.target.files) {
                            const newFiles = Array.from(e.target.files).map((f) => f.name);
                            setSelectedFiles((prev) => {
                              const combined = [...prev, ...newFiles].slice(0, 3);
                              setErrors((current) => ({ ...current, files: "" }));
                              return combined;
                            });
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="button button--secondary"
                        onClick={() => document.getElementById("files-upload")?.click()}
                        disabled={selectedFiles.length >= 3}
                      >
                        เลือกไฟล์ (Upload file)
                      </button>
                      <span className="file-upload-hint">
                        จำกัดไม่เกิน 3 ไฟล์, ขนาดไม่เกิน 1GB ต่อไฟล์, ชนิดไฟล์ที่อนุญาต: Word, Excel, PPT, PDF, รูปภาพ, วิดีโอ, เสียง
                      </span>

                      {selectedFiles.length > 0 && (
                        <div className="selected-files-list">
                          {selectedFiles.map((fileName, index) => (
                            <div key={index} className="selected-file-item">
                              <span className="file-name">{fileName}</span>
                              <button
                                type="button"
                                className="remove-file-btn"
                                onClick={() => {
                                  setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
                                }}
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormField>
                </div>

                <div style={{ marginTop: "18px" }}>
                  <FormField
                    htmlFor="exclusion-filters"
                    label="จากการตรวจสอบผลงานท่านต้องการให้ Exclusion Filters ข้อใดบ้าง (For the plagiarism check, which Exclusion Filters would you like to apply?)"
                  >
                    <div className="checkbox-group" id="exclusion-filters">
                      {[
                        { value: "Exclude bibliography", label: "1. Exclude bibliography" },
                        { value: "Exclude quoted text", label: "2. Exclude quoted text" },
                        { value: "Exclude cited text", label: "3. Exclude cited text" },
                        { value: "Abstract", label: "4. Abstract" },
                        { value: "Methods and Materials", label: "5. Methods and Materials" },
                        { value: "Exclude small matches", label: "6. Exclude small matches" }
                      ].map((opt) => (
                        <label key={opt.value} className="checkbox-label">
                          <input
                            type="checkbox"
                            value={opt.value}
                            checked={exclusionFilters.includes(opt.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setExclusionFilters((prev) => [...prev, opt.value]);
                              } else {
                                setExclusionFilters((prev) =>
                                  prev.filter((item) => item !== opt.value)
                                );
                              }
                            }}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </FormField>
                </div>

                <div style={{ marginTop: "18px" }}>
                  <FormField
                    htmlFor="additionalNotes"
                    label="แจ้งรายละเอียดที่ท่านต้องการเพิ่มเติม"
                  >
                    <textarea
                      id="additionalNotes"
                      rows={4}
                      placeholder="เช่น ข้อมูลอื่นๆ หรือคำขอพิเศษ"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                  </FormField>
                </div>

                <div style={{ marginTop: "18px" }}>
                  <FormField
                    error={errors.wantAiReport}
                    htmlFor="wantAiReport"
                    label="ท่านต้องการรายงานผลการตรวจจาก AI หรือไม่? (ทั้งนี้ AI Detector สามารถตรวจได้เฉพาะภาษาอังกฤษเท่านั้น) *"
                  >
                    <div className="radio-group" id="wantAiReport">
                      {[
                        { value: "ต้องการ", label: "ต้องการ" },
                        { value: "ไม่ต้องการ", label: "ไม่ต้องการ" }
                      ].map((opt) => (
                        <label key={opt.value} className="radio-label">
                          <input
                            type="radio"
                            name="wantAiReport"
                            value={opt.value}
                            checked={wantAiReport === opt.value}
                            onChange={(e) => {
                              setWantAiReport(e.target.value);
                              setErrors((current) => ({ ...current, wantAiReport: "" }));
                            }}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </FormField>
                </div>
              </>
            ) : payload.requestType === "บริการ Find Fulltext 4U" ? (
              <>
                <div className="form-grid" style={{ marginTop: "18px" }}>
                  <FormField
                    error={errors.ftStatus}
                    htmlFor="ftStatus"
                    label="สถานะ (Status) *"
                  >
                    <select
                      id="ftStatus"
                      value={ftStatus}
                      onChange={(e) => {
                        setFtStatus(e.target.value);
                        setErrors((current) => ({ ...current, ftStatus: "" }));
                      }}
                    >
                      <option value="">เลือกสถานะ</option>
                      <option value="นักศึกษา (Student)">นักศึกษา (Student)</option>
                      <option value="อาจารย์ (Faculty)">อาจารย์ (Faculty)</option>
                      <option value="บุคลากร (Staff)">บุคลากร (Staff)</option>
                    </select>
                  </FormField>

                  <FormField
                    error={errors.ftFaculty}
                    htmlFor="ftFaculty"
                    label="คณะ (Faculty) *"
                  >
                    <select
                      id="ftFaculty"
                      value={ftFaculty}
                      onChange={(e) => {
                        setFtFaculty(e.target.value);
                        setErrors((current) => ({ ...current, ftFaculty: "" }));
                      }}
                    >
                      <option value="">เลือกคณะ</option>
                      <option value="คณะแพทยศาสตร์ (Faculty of Medicine)">คณะแพทยศาสตร์ (Faculty of Medicine)</option>
                      <option value="คณะทันตแพทยศาสตร์ (Faculty of Dentistry)">คณะทันตแพทยศาสตร์ (Faculty of Dentistry)</option>
                      <option value="คณะเภสัชศาสตร์ (Faculty of Pharmaceutical Sciences)">คณะเภสัชศาสตร์ (Faculty of Pharmaceutical Sciences)</option>
                      <option value="คณะพยาบาลศาสตร์ (Faculty of Nursing)">คณะพยาบาลศาสตร์ (Faculty of Nursing)</option>
                      <option value="คณะวิทยาศาสตร์ (Faculty of Science)">คณะวิทยาศาสตร์ (Faculty of Science)</option>
                      <option value="คณะวิศวกรรมศาสตร์ (Faculty of Engineering)">คณะวิศวกรรมศาสตร์ (Faculty of Engineering)</option>
                      <option value="คณะวิทยาการจัดการ (Faculty of Management Sciences)">คณะวิทยาการจัดการ (Faculty of Management Sciences)</option>
                      <option value="คณะศิลปศาสตร์ (Faculty of Liberal Arts)">คณะศิลปศาสตร์ (Faculty of Liberal Arts)</option>
                      <option value="คณะทรัพยากรธรรมชาติ (Faculty of Natural Resources)">คณะทรัพยากรธรรมชาติ (Faculty of Natural Resources)</option>
                      <option value="คณะอุตสาหกรรมเกษตร (Faculty of Agro-Industry)">คณะอุตสาหกรรมเกษตร (Faculty of Agro-Industry)</option>
                      <option value="คณะการแพทย์แผนไทย (Faculty of Traditional Thai Medicine)">คณะการแพทย์แผนไทย (Faculty of Traditional Thai Medicine)</option>
                    </select>
                  </FormField>

                  <FormField
                    error={errors.ftTelephone}
                    htmlFor="ftTelephone"
                    label="Telephone number"
                  >
                    <input
                      id="ftTelephone"
                      type="tel"
                      placeholder="เบอร์โทรศัพท์ติดต่อ"
                      value={ftTelephone}
                      onChange={(e) => setFtTelephone(e.target.value)}
                    />
                  </FormField>
                </div>

                <div style={{ marginTop: "18px", padding: "12px 0", borderBottom: "1px dashed var(--border)" }}>
                  <h3 style={{ margin: 0, color: "var(--primary)", fontSize: "1.1rem" }}>รายละเอียดบทความ (Article Details)</h3>
                  <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.85rem" }}>
                    กรุณากรอกรายละเอียดของบทความที่ต้องการฉบับเต็ม ให้ครบถ้วน (Please fill in the full-text description of the required article)
                  </p>
                </div>

                <div className="form-grid" style={{ marginTop: "18px" }}>
                  <FormField
                    error={errors.ftArticleTitle}
                    htmlFor="ftArticleTitle"
                    label="ชื่อบทความ (Title) *"
                  >
                    <input
                      id="ftArticleTitle"
                      type="text"
                      placeholder="ระบุชื่อบทความ"
                      value={ftArticleTitle}
                      onChange={(e) => {
                        setFtArticleTitle(e.target.value);
                        setErrors((current) => ({ ...current, ftArticleTitle: "" }));
                      }}
                    />
                  </FormField>

                  <FormField
                    error={errors.ftDoi}
                    htmlFor="ftDoi"
                    label="DOI *"
                  >
                    <input
                      id="ftDoi"
                      type="text"
                      placeholder="เช่น https://doi.org/10.1000/xyz123"
                      value={ftDoi}
                      onChange={(e) => {
                        setFtDoi(e.target.value);
                        setErrors((current) => ({ ...current, ftDoi: "" }));
                      }}
                    />
                  </FormField>
                </div>

                <div style={{ marginTop: "18px" }}>
                  <FormField
                    error={errors.ftMoreInfo}
                    htmlFor="ftMoreInfo"
                    label="More information Extras: Supplementary, Table"
                  >
                    <textarea
                      id="ftMoreInfo"
                      rows={4}
                      placeholder="กรอกรายละเอียดข้อมูลเพิ่มเติม"
                      value={ftMoreInfo}
                      onChange={(e) => setFtMoreInfo(e.target.value)}
                    />
                  </FormField>
                </div>

                <div style={{ marginTop: "18px" }}>
                  <FormField
                    error={errors.ftPurchaseConsent}
                    htmlFor="ftPurchaseConsent"
                    label="หากทางหอสมุดไม่สามารถค้นหาบทความจากแหล่งต่าง ๆ ในประเทศได้ ท่านต้องการให้หอสมุดจัดซื้อบทความดังกล่าวจากสำนักพิมพ์หรือไม่ (If the library cannot find it from other libraries in Thailand, Would you like the library to purchase the article from the publisher?) *"
                  >
                    <div className="radio-group" id="ftPurchaseConsent">
                      {[
                        { value: "ต้องการจัดซื้อ( Purchase )", label: "ต้องการจัดซื้อ( Purchase )" },
                        { value: "ไม่ต้องการจัดซื้อ ( Do not purchase )", label: "ไม่ต้องการจัดซื้อ ( Do not purchase )" }
                      ].map((opt) => (
                        <label key={opt.value} className="checkbox-label">
                          <input
                            type="radio"
                            name="ftPurchaseConsent"
                            value={opt.value}
                            checked={ftPurchaseConsent === opt.value}
                            onChange={(e) => {
                              setFtPurchaseConsent(e.target.value);
                              setErrors((current) => ({ ...current, ftPurchaseConsent: "" }));
                            }}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </FormField>
                </div>
              </>
            ) : payload.requestType === "บริการนำส่งหนังสือ (Book Delivery)" ? (
              <>
                <div className="form-grid" style={{ marginTop: "18px" }}>
                  <FormField
                    error={errors.delId}
                    htmlFor="delId"
                    label="Staff ID/ Student ID/ Other *"
                  >
                    <input
                      id="delId"
                      type="text"
                      placeholder="กรอกรหัสประจำตัว"
                      value={delId}
                      onChange={(e) => {
                        setDelId(e.target.value);
                        setErrors((current) => ({ ...current, delId: "" }));
                      }}
                    />
                  </FormField>

                  <FormField
                    error={errors.delStatus}
                    htmlFor="delStatus"
                    label="Status *"
                  >
                    <select
                      id="delStatus"
                      value={delStatus}
                      onChange={(e) => {
                        setDelStatus(e.target.value);
                        setErrors((current) => ({ ...current, delStatus: "" }));
                      }}
                    >
                      <option value="">เลือกสถานภาพ</option>
                      <option value="Student/ นักศึกษา">Student/ นักศึกษา</option>
                      <option value="Staff/ บุคลากร">Staff/ บุคลากร</option>
                      <option value="Faculty/ อาจารย์">Faculty/ อาจารย์</option>
                    </select>
                  </FormField>

                  <FormField
                    error={errors.delFaculty}
                    htmlFor="delFaculty"
                    label="Faculty *"
                  >
                    <select
                      id="delFaculty"
                      value={delFaculty}
                      onChange={(e) => {
                        setDelFaculty(e.target.value);
                        setErrors((current) => ({ ...current, delFaculty: "" }));
                      }}
                    >
                      <option value="">เลือกคณะ</option>
                      <option value="คณะแพทยศาสตร์ (Faculty of Medicine)">คณะแพทยศาสตร์ (Faculty of Medicine)</option>
                      <option value="คณะทันตแพทยศาสตร์ (Faculty of Dentistry)">คณะทันตแพทยศาสตร์ (Faculty of Dentistry)</option>
                      <option value="คณะเภสัชศาสตร์ (Faculty of Pharmaceutical Sciences)">คณะเภสัชศาสตร์ (Faculty of Pharmaceutical Sciences)</option>
                      <option value="คณะพยาบาลศาสตร์ (Faculty of Nursing)">คณะพยาบาลศาสตร์ (Faculty of Nursing)</option>
                      <option value="คณะวิทยาศาสตร์ (Faculty of Science)">คณะวิทยาศาสตร์ (Faculty of Science)</option>
                      <option value="คณะวิศวกรรมศาสตร์ (Faculty of Engineering)">คณะวิศวกรรมศาสตร์ (Faculty of Engineering)</option>
                      <option value="คณะวิทยาการจัดการ (Faculty of Management Sciences)">คณะวิทยาการจัดการ (Faculty of Management Sciences)</option>
                      <option value="คณะศิลปศาสตร์ (Faculty of Liberal Arts)">คณะศิลปศาสตร์ (Faculty of Liberal Arts)</option>
                      <option value="คณะทรัพยากรธรรมชาติ (Faculty of Natural Resources)">คณะทรัพยากรธรรมชาติ (Faculty of Natural Resources)</option>
                      <option value="คณะอุตสาหกรรมเกษตร (Faculty of Agro-Industry)">คณะอุตสาหกรรมเกษตร (Faculty of Agro-Industry)</option>
                      <option value="คณะการแพทย์แผนไทย (Faculty of Traditional Thai Medicine)">คณะการแพทย์แผนไทย (Faculty of Traditional Thai Medicine)</option>
                    </select>
                  </FormField>
                </div>

                <div className="form-grid" style={{ marginTop: "18px" }}>
                  <FormField
                    error={errors.delBookTitle}
                    htmlFor="delBookTitle"
                    label="Book Title *"
                  >
                    <input
                      id="delBookTitle"
                      type="text"
                      placeholder="กรอกชื่อหนังสือ"
                      value={delBookTitle}
                      onChange={(e) => {
                        setDelBookTitle(e.target.value);
                        setErrors((current) => ({ ...current, delBookTitle: "" }));
                      }}
                    />
                  </FormField>

                  <FormField
                    error={errors.delLcCall}
                    htmlFor="delLcCall"
                    label="LC Call *"
                  >
                    <input
                      id="delLcCall"
                      type="text"
                      placeholder="กรอกเลขเรียกหนังสือ (เช่น QA76.73.J38)"
                      value={delLcCall}
                      onChange={(e) => {
                        setDelLcCall(e.target.value);
                        setErrors((current) => ({ ...current, delLcCall: "" }));
                      }}
                    />
                  </FormField>

                  <FormField
                    error={errors.delCollection}
                    htmlFor="delCollection"
                    label="Collection *"
                  >
                    <select
                      id="delCollection"
                      value={delCollection}
                      onChange={(e) => {
                        setDelCollection(e.target.value);
                        setErrors((current) => ({ ...current, delCollection: "" }));
                      }}
                    >
                      <option value="">เลือก Collection</option>
                      <option value="หนังสือภาษาไทย (Thai Book Collection)">หนังสือภาษาไทย (Thai Book Collection)</option>
                      <option value="หนังสือภาษาต่างประเทศ (Foreign Book Collection)">หนังสือภาษาต่างประเทศ (Foreign Book Collection)</option>
                      <option value="วิทยานิพนธ์และวิจัย (Theses & Research)">วิทยานิพนธ์และวิจัย (Theses & Research)</option>
                      <option value="หนังสืออ้างอิง (Reference Books)">หนังสืออ้างอิง (Reference Books)</option>
                      <option value="สิ่งพิมพ์พิเศษ (Special Publications)">สิ่งพิมพ์พิเศษ (Special Publications)</option>
                    </select>
                  </FormField>
                </div>
              </>
            ) : (
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
