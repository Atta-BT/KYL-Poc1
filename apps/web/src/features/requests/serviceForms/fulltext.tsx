import { FormField } from "../../../components";
import type { ServiceFormModule, ServiceFormProps } from "./types";
import { FACULTIES, OTHER_FACULTY } from "./facultyOptions";

export interface FulltextValue {
  status: string;
  faculty: string;
  facultyOther: string;
  telephone: string;
  articleTitle: string;
  doi: string;
  moreInfo: string;
  purchaseConsent: string;
}

const PURCHASE_OPTIONS = [
  { value: "ต้องการจัดซื้อ( Purchase )", label: "ต้องการจัดซื้อ( Purchase )" },
  { value: "ไม่ต้องการจัดซื้อ ( Do not purchase )", label: "ไม่ต้องการจัดซื้อ ( Do not purchase )" }
];

const FulltextForm = ({
  value,
  onChange,
  errors,
  clearError
}: ServiceFormProps<FulltextValue>) => {
  const set = (patch: Partial<FulltextValue>) =>
    onChange({ ...value, ...patch });

  return (
    <>
      <div className="form-grid" style={{ marginTop: "18px" }}>
        <FormField error={errors.ftStatus} htmlFor="ftStatus" label="สถานะ (Status) *">
          <select
            id="ftStatus"
            value={value.status}
            onChange={(e) => {
              set({ status: e.target.value });
              clearError("ftStatus");
            }}
          >
            <option value="">เลือกสถานะ</option>
            <option value="นักศึกษา (Student)">นักศึกษา (Student)</option>
            <option value="อาจารย์ (Faculty)">อาจารย์ (Faculty)</option>
            <option value="บุคลากร (Staff)">บุคลากร (Staff)</option>
          </select>
        </FormField>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <FormField error={errors.ftFaculty} htmlFor="ftFaculty" label="คณะ (Faculty) *">
            <select
              id="ftFaculty"
              value={value.faculty}
              onChange={(e) => {
                const v = e.target.value;
                set(v !== OTHER_FACULTY ? { faculty: v, facultyOther: "" } : { faculty: v });
                clearError("ftFaculty");
              }}
            >
              <option value="">เลือกคณะ</option>
              {FACULTIES.map((faculty) => (
                <option key={faculty} value={faculty}>
                  {faculty}
                </option>
              ))}
              <option value={OTHER_FACULTY}>{OTHER_FACULTY}</option>
            </select>
          </FormField>

          {value.faculty === OTHER_FACULTY && (
            <FormField
              error={errors.ftFacultyOther}
              htmlFor="ftFacultyOther"
              label="คณะอื่น ๆ (โปรดระบุ) Other Faculties (please specify)"
            >
              <input
                id="ftFacultyOther"
                type="text"
                placeholder="ระบุคณะ/หน่วยงานของคุณ"
                value={value.facultyOther}
                onChange={(e) => {
                  set({ facultyOther: e.target.value });
                  clearError("ftFacultyOther");
                }}
              />
            </FormField>
          )}
        </div>

        <FormField error={errors.ftTelephone} htmlFor="ftTelephone" label="Telephone number">
          <input
            id="ftTelephone"
            type="tel"
            placeholder="เบอร์โทรศัพท์ติดต่อ"
            value={value.telephone}
            onChange={(e) => set({ telephone: e.target.value })}
          />
        </FormField>
      </div>

      <div
        style={{
          marginTop: "18px",
          padding: "12px 0",
          borderBottom: "1px dashed var(--border)"
        }}
      >
        <h3 style={{ margin: 0, color: "var(--primary)", fontSize: "1.1rem" }}>
          รายละเอียดบทความ (Article Details)
        </h3>
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
            value={value.articleTitle}
            onChange={(e) => {
              set({ articleTitle: e.target.value });
              clearError("ftArticleTitle");
            }}
          />
        </FormField>

        <FormField error={errors.ftDoi} htmlFor="ftDoi" label="DOI *">
          <input
            id="ftDoi"
            type="text"
            placeholder="เช่น https://doi.org/10.1000/xyz123"
            value={value.doi}
            onChange={(e) => {
              set({ doi: e.target.value });
              clearError("ftDoi");
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
            value={value.moreInfo}
            onChange={(e) => set({ moreInfo: e.target.value })}
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
            {PURCHASE_OPTIONS.map((opt) => (
              <label key={opt.value} className="checkbox-label">
                <input
                  type="radio"
                  name="ftPurchaseConsent"
                  value={opt.value}
                  checked={value.purchaseConsent === opt.value}
                  onChange={(e) => {
                    set({ purchaseConsent: e.target.value });
                    clearError("ftPurchaseConsent");
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

export const fulltextForm: ServiceFormModule<FulltextValue> = {
  type: "บริการ Find Fulltext 4U",

  emptyValue: {
    status: "",
    faculty: "",
    facultyOther: "",
    telephone: "",
    articleTitle: "",
    doi: "",
    moreInfo: "",
    purchaseConsent: ""
  },

  fromRequest: (request) => ({
    status: request.fulltextStatus || "",
    faculty: request.fulltextFaculty || "",
    facultyOther: request.fulltextFacultyOther || "",
    telephone: request.fulltextTelephone || "",
    articleTitle: request.fulltextArticleTitle || "",
    doi: request.fulltextDoi || "",
    moreInfo: request.fulltextMoreInfo || "",
    purchaseConsent: request.fulltextPurchaseConsent || ""
  }),

  validate: (value) => {
    const errors: Record<string, string> = {};
    if (!value.status) errors.ftStatus = "กรุณาเลือกสถานะ";
    if (!value.faculty) {
      errors.ftFaculty = "กรุณาเลือกคณะ";
    } else if (value.faculty === OTHER_FACULTY && !value.facultyOther.trim()) {
      errors.ftFacultyOther = "กรุณาระบุคณะ/หน่วยงาน";
    }
    if (!value.articleTitle.trim()) errors.ftArticleTitle = "กรุณากรอกชื่อบทความ";
    if (!value.doi.trim()) errors.ftDoi = "กรุณากรอก DOI";
    if (!value.purchaseConsent) errors.ftPurchaseConsent = "กรุณาเลือกความต้องการจัดซื้อ";
    return errors;
  },

  buildPayload: (value) => ({
    detail: value.moreInfo.trim() || "-",
    extra: {
      fulltextStatus: value.status,
      fulltextFaculty: value.faculty,
      fulltextFacultyOther: value.facultyOther || null,
      fulltextTelephone: value.telephone || null,
      fulltextArticleTitle: value.articleTitle,
      fulltextDoi: value.doi,
      fulltextMoreInfo: value.moreInfo || null,
      fulltextPurchaseConsent: value.purchaseConsent
    }
  }),

  Form: FulltextForm
};
