import { FormField } from "../../../components";
import type { ServiceFormModule, ServiceFormProps } from "./types";
import { FACULTIES, OTHER_FACULTY } from "./facultyOptions";

export interface InterlibraryLoanValue {
  staffStudentId: string;
  status: string;
  faculty: string;
  facultyOther: string;
  telephone: string;
  resourceTitle: string;
  author: string;
  itemType: string;
  sourceLibrary: string;
  needByDate: string;
  description: string;
}

const ITEM_TYPE_OPTIONS = [
  "หนังสือ (Book)",
  "บทความวารสาร (Journal Article)",
  "วิทยานิพนธ์/งานวิจัย (Thesis/Research)",
  "อื่น ๆ (Other)"
];

const InterlibraryLoanForm = ({
  value,
  onChange,
  errors,
  clearError
}: ServiceFormProps<InterlibraryLoanValue>) => {
  const set = (patch: Partial<InterlibraryLoanValue>) =>
    onChange({ ...value, ...patch });

  return (
    <>
      <div className="form-grid" style={{ marginTop: "18px" }}>
        {/* <FormField error={errors.illId} htmlFor="illId" label="Staff ID/ Student ID/ Other *">
          <input
            id="illId"
            type="text"
            placeholder="กรอกรหัสประจำตัว"
            value={value.staffStudentId}
            onChange={(e) => {
              set({ staffStudentId: e.target.value });
              clearError("illId");
            }}
          />
        </FormField> */}

        {/* <FormField error={errors.illStatus} htmlFor="illStatus" label="Status *">
          <select
            id="illStatus"
            value={value.status}
            onChange={(e) => {
              set({ status: e.target.value });
              clearError("illStatus");
            }}
          >
            <option value="">เลือกสถานภาพ</option>
            <option value="Student/ นักศึกษา">Student/ นักศึกษา</option>
            <option value="Staff/ บุคลากร">Staff/ บุคลากร</option>
            <option value="Faculty/ อาจารย์">Faculty/ อาจารย์</option>
          </select>
        </FormField> */}

        {/* <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <FormField error={errors.illFaculty} htmlFor="illFaculty" label="Faculty *">
            <select
              id="illFaculty"
              value={value.faculty}
              onChange={(e) => {
                const v = e.target.value;
                set(v !== OTHER_FACULTY ? { faculty: v, facultyOther: "" } : { faculty: v });
                clearError("illFaculty");
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
              error={errors.illFacultyOther}
              htmlFor="illFacultyOther"
              label="คณะอื่น ๆ (โปรดระบุ) Other Faculties (please specify)"
            >
              <input
                id="illFacultyOther"
                type="text"
                placeholder="ระบุคณะ/หน่วยงานของคุณ"
                value={value.facultyOther}
                onChange={(e) => {
                  set({ facultyOther: e.target.value });
                  clearError("illFacultyOther");
                }}
              />
            </FormField>
          )}
        </div>

        <FormField error={errors.illTel} htmlFor="illTel" label="เบอร์โทรศัพท์ (Telephone) *">
          <input
            id="illTel"
            type="tel"
            placeholder="กรอกเบอร์โทรศัพท์"
            value={value.telephone}
            onChange={(e) => {
              set({ telephone: e.target.value });
              clearError("illTel");
            }}
          />
        </FormField>
      </div>

      <div className="form-grid" style={{ marginTop: "18px" }}>
        <FormField error={errors.illTitle} htmlFor="illTitle" label="ชื่อทรัพยากรที่ต้องการ (Title) *">
          <input
            id="illTitle"
            type="text"
            placeholder="กรอกชื่อหนังสือ/บทความที่ต้องการยืม"
            value={value.resourceTitle}
            onChange={(e) => {
              set({ resourceTitle: e.target.value });
              clearError("illTitle");
            }}
          />
        </FormField>

        <FormField error={errors.illAuthor} htmlFor="illAuthor" label="ผู้แต่ง (Author)">
          <input
            id="illAuthor"
            type="text"
            placeholder="กรอกชื่อผู้แต่ง (ถ้าทราบ)"
            value={value.author}
            onChange={(e) => {
              set({ author: e.target.value });
              clearError("illAuthor");
            }}
          />
        </FormField>

        <FormField error={errors.illItemType} htmlFor="illItemType" label="ประเภททรัพยากร (Item Type) *">
          <select
            id="illItemType"
            value={value.itemType}
            onChange={(e) => {
              set({ itemType: e.target.value });
              clearError("illItemType");
            }}
          >
            <option value="">เลือกประเภททรัพยากร</option>
            {ITEM_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          error={errors.illSource}
          htmlFor="illSource"
          label="ห้องสมุด/สถาบันต้นทาง (Source Library)"
        >
          <input
            id="illSource"
            type="text"
            placeholder="ระบุห้องสมุด/สถาบันต้นทาง (ถ้าทราบ)"
            value={value.sourceLibrary}
            onChange={(e) => {
              set({ sourceLibrary: e.target.value });
              clearError("illSource");
            }}
          />
        </FormField>

        <FormField
          error={errors.illNeedBy}
          htmlFor="illNeedBy"
          label="วันที่ต้องการใช้ (Need By Date)"
        >
          <input
            id="illNeedBy"
            type="date"
            value={value.needByDate}
            onChange={(e) => {
              set({ needByDate: e.target.value });
              clearError("illNeedBy");
            }}
          />
        </FormField> */}
      </div>
      <FormField
        error={errors.pubDescription}
        htmlFor="pubDescription"
        label="รายละเอียดเพิ่มเติม (Description)"
      >
        <textarea
          id="pubDescription"
          rows={5}
          placeholder="กรอกรายละเอียดเพิ่มเติม"
          value={value.description}
          onChange={(e) => {
            set({ description: e.target.value });
            clearError("pubDescription");
          }}
        />
      </FormField> 
    </>
  );
};

export const interlibraryLoanForm: ServiceFormModule<InterlibraryLoanValue> = {
  type: "บริการยืมระหว่างห้องสมุด",

  emptyValue: {
    staffStudentId: "",
    status: "",
    faculty: "",
    facultyOther: "",
    telephone: "",
    resourceTitle: "",
    author: "",
    itemType: "",
    sourceLibrary: "",
    needByDate: "",
    description: ""
  },

  fromRequest: (request) => ({
    staffStudentId: request.illStaffStudentId || "",
    status: request.illStatus || "",
    faculty: request.illFaculty || "",
    facultyOther: request.illFacultyOther || "",
    telephone: request.illTelephone || "",
    resourceTitle: request.illResourceTitle || "",
    author: request.illAuthor || "",
    itemType: request.illItemType || "",
    sourceLibrary: request.illSourceLibrary || "",
    needByDate: request.illNeedByDate || "",
    description: request.pubDescription || ""
  }),

  validate: (value) => {
    const errors: Record<string, string> = {};
    if (!value.staffStudentId.trim()) errors.illId = "กรุณากรอกรหัสนักศึกษา/พนักงาน";
    if (!value.status) errors.illStatus = "กรุณาเลือกสถานภาพ";
    if (!value.faculty) {
      errors.illFaculty = "กรุณาเลือกคณะ";
    } else if (value.faculty === OTHER_FACULTY && !value.facultyOther.trim()) {
      errors.illFacultyOther = "กรุณาระบุคณะ/หน่วยงาน";
    }
    if (!value.telephone.trim()) errors.illTel = "กรุณากรอกเบอร์โทรศัพท์";
    if (!value.resourceTitle.trim()) errors.illTitle = "กรุณากรอกชื่อทรัพยากรที่ต้องการ";
    if (!value.itemType) errors.illItemType = "กรุณาเลือกประเภททรัพยากร";
    return errors;
  },

  buildPayload: (value) => ({
    detail: `Title: ${value.resourceTitle} (${value.itemType})`,
    extra: {
      illStaffStudentId: value.staffStudentId,
      illStatus: value.status,
      illFaculty: value.faculty,
      illFacultyOther: value.facultyOther || null,
      illTelephone: value.telephone,
      illResourceTitle: value.resourceTitle,
      illAuthor: value.author || null,
      illItemType: value.itemType,
      illSourceLibrary: value.sourceLibrary || null,
      illNeedByDate: value.needByDate || null
    }
  }),

  Form: InterlibraryLoanForm
};
