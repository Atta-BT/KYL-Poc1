import { FormField } from "../../../components";
import type { ServiceFormModule, ServiceFormProps } from "./types";
import { FACULTIES, OTHER_FACULTY } from "./facultyOptions";

export interface IthenticateValue {
  status: string;
  faculty: string;
  facultyOther: string;
  telephone: string;
  files: string[];
  exclusionFilters: string[];
  additionalNotes: string;
  wantAiReport: string;
}

const STATUS_OPTIONS = [
  { value: "อาจารย์ (Faculty Member)", label: "1. อาจารย์ (Faculty Member)" },
  { value: "บุคลากรสายสนับสนุน (Support Staff)", label: "2. บุคลากรสายสนับสนุน (Support Staff)" },
  { value: "นักศึกษาระดับบัณฑิตศึกษา (Graduate Student)", label: "3. นักศึกษาระดับบัณฑิตศึกษา (Graduate Student)" },
  { value: "นักศึกษาระดับปริญญาตรี (Undergraduate Student)", label: "4. นักศึกษาระดับปริญญาตรี (Undergraduate Student)" }
];

const EXCLUSION_OPTIONS = [
  { value: "Exclude bibliography", label: "1. Exclude bibliography" },
  { value: "Exclude quoted text", label: "2. Exclude quoted text" },
  { value: "Exclude cited text", label: "3. Exclude cited text" },
  { value: "Abstract", label: "4. Abstract" },
  { value: "Methods and Materials", label: "5. Methods and Materials" },
  { value: "Exclude small matches", label: "6. Exclude small matches" }
];

const IthenticateForm = ({
  value,
  onChange,
  errors,
  clearError
}: ServiceFormProps<IthenticateValue>) => {
  const set = (patch: Partial<IthenticateValue>) =>
    onChange({ ...value, ...patch });

  return (
    <>
      <div className="form-grid" style={{ marginTop: "18px" }}>
        <FormField error={errors.status} htmlFor="status" label="สถานภาพ (Status) *">
          <div className="radio-group" id="status">
            {STATUS_OPTIONS.map((opt) => (
              <label key={opt.value} className="radio-label">
                <input
                  type="radio"
                  name="status"
                  value={opt.value}
                  checked={value.status === opt.value}
                  onChange={(e) => {
                    set({ status: e.target.value });
                    clearError("status");
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
              value={value.faculty}
              onChange={(e) => {
                const v = e.target.value;
                set(v !== OTHER_FACULTY ? { faculty: v, facultyOther: "" } : { faculty: v });
              }}
            >
              <option value="">เลือกคณะ/หน่วยงาน</option>
              {FACULTIES.map((faculty, index) => (
                <option key={faculty} value={faculty}>
                  {index + 1}. {faculty}
                </option>
              ))}
              <option value={OTHER_FACULTY}>{OTHER_FACULTY}</option>
            </select>
          </FormField>

          {value.faculty === OTHER_FACULTY && (
            <FormField
              error={errors.facultyOther}
              htmlFor="facultyOther"
              label="คณะอื่น ๆ (โปรดระบุ) Other Faculties (please specify)"
            >
              <input
                id="facultyOther"
                type="text"
                placeholder="ระบุคณะ/หน่วยงานของคุณ"
                value={value.facultyOther}
                onChange={(e) => set({ facultyOther: e.target.value })}
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
              value={value.telephone}
              onChange={(e) => {
                set({ telephone: e.target.value });
                clearError("telephone");
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
                  set({ files: [...value.files, ...newFiles].slice(0, 3) });
                  clearError("files");
                }
              }}
            />
            <button
              type="button"
              className="button button--secondary"
              onClick={() => document.getElementById("files-upload")?.click()}
              disabled={value.files.length >= 3}
            >
              เลือกไฟล์ (Upload file)
            </button>
            <span className="file-upload-hint">
              จำกัดไม่เกิน 3 ไฟล์, ขนาดไม่เกิน 1GB ต่อไฟล์, ชนิดไฟล์ที่อนุญาต: Word, Excel, PPT, PDF, รูปภาพ, วิดีโอ, เสียง
            </span>

            {value.files.length > 0 && (
              <div className="selected-files-list">
                {value.files.map((fileName, index) => (
                  <div key={index} className="selected-file-item">
                    <span className="file-name">{fileName}</span>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={() =>
                        set({ files: value.files.filter((_, i) => i !== index) })
                      }
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
            {EXCLUSION_OPTIONS.map((opt) => (
              <label key={opt.value} className="checkbox-label">
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={value.exclusionFilters.includes(opt.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      set({ exclusionFilters: [...value.exclusionFilters, opt.value] });
                    } else {
                      set({
                        exclusionFilters: value.exclusionFilters.filter(
                          (item) => item !== opt.value
                        )
                      });
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
        <FormField htmlFor="additionalNotes" label="แจ้งรายละเอียดที่ท่านต้องการเพิ่มเติม">
          <textarea
            id="additionalNotes"
            rows={4}
            placeholder="เช่น ข้อมูลอื่นๆ หรือคำขอพิเศษ"
            value={value.additionalNotes}
            onChange={(e) => set({ additionalNotes: e.target.value })}
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
                  checked={value.wantAiReport === opt.value}
                  onChange={(e) => {
                    set({ wantAiReport: e.target.value });
                    clearError("wantAiReport");
                  }}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </FormField>
      </div>
    </>
  );
};

export const ithenticateForm: ServiceFormModule<IthenticateValue> = {
  type: "บริการตรวจการคัดลอกผลงาน (iThenticate)",

  emptyValue: {
    status: "",
    faculty: "",
    facultyOther: "",
    telephone: "",
    files: [],
    exclusionFilters: [],
    additionalNotes: "",
    wantAiReport: ""
  },

  fromRequest: (request) => ({
    status: request.ithenticateStatus || "",
    faculty: request.ithenticateFaculty || "",
    facultyOther: request.ithenticateFacultyOther || "",
    telephone: request.ithenticateTelephone || "",
    files: request.ithenticateFiles || [],
    exclusionFilters: request.ithenticateExclusionFilters || [],
    additionalNotes: request.detail || "",
    wantAiReport: request.ithenticateWantAiReport || ""
  }),

  validate: (value) => {
    const errors: Record<string, string> = {};
    if (!value.status) errors.status = "กรุณาเลือกสถานภาพ";
    if (!value.telephone.trim()) errors.telephone = "กรุณากรอกเบอร์โทรศัพท์ติดต่อกลับ";
    if (value.files.length === 0) errors.files = "กรุณาอัปโหลดไฟล์เอกสารอย่างน้อย 1 ไฟล์";
    if (!value.wantAiReport) errors.wantAiReport = "กรุณาเลือกความต้องการรายงานผลตรวจจาก AI";
    return errors;
  },

  buildPayload: (value) => ({
    detail: value.additionalNotes.trim() || "-",
    extra: {
      ithenticateStatus: value.status,
      ithenticateFaculty: value.faculty || null,
      ithenticateFacultyOther: value.facultyOther || null,
      ithenticateTelephone: value.telephone,
      ithenticateFiles: value.files,
      ithenticateExclusionFilters: value.exclusionFilters,
      ithenticateWantAiReport: value.wantAiReport
    }
  }),

  Form: IthenticateForm
};
