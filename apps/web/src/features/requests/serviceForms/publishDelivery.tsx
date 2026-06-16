import { FormField } from "../../../components";
import type { ServiceFormModule, ServiceFormProps } from "./types";
import { FACULTIES, OTHER_FACULTY } from "./facultyOptions";

export interface PublishDeliveryValue {
  staffStudentId: string;
  status: string;
  faculty: string;
  facultyOther: string;
  telephone: string;
  workTitle: string;
  workType: string;
  author: string;
  year: string;
  description: string;
}

const WORK_TYPE_OPTIONS = [
  "หนังสือ (Book)",
  "ตำรา (Textbook)",
  "บทความ (Article)",
  "งานวิจัย (Research)",
  "อื่น ๆ (Other)"
];

const PublishDeliveryForm = ({
  value,
  onChange,
  errors,
  clearError
}: ServiceFormProps<PublishDeliveryValue>) => {
  const set = (patch: Partial<PublishDeliveryValue>) =>
    onChange({ ...value, ...patch });

  return (
    <>
      <div className="form-grid" style={{ marginTop: "18px" }}>
        {/* <FormField error={errors.pubId} htmlFor="pubId" label="Staff ID/ Student ID/ Other *">
          <input
            id="pubId"
            type="text"
            placeholder="กรอกรหัสประจำตัว"
            value={value.staffStudentId}
            onChange={(e) => {
              set({ staffStudentId: e.target.value });
              clearError("pubId");
            }}
          />
        </FormField> */}

        {/* <FormField error={errors.pubStatus} htmlFor="pubStatus" label="Status *">
          <select
            id="pubStatus"
            value={value.status}
            onChange={(e) => {
              set({ status: e.target.value });
              clearError("pubStatus");
            }}
          >
            <option value="">เลือกสถานภาพ</option>
            <option value="Student/ นักศึกษา">Student/ นักศึกษา</option>
            <option value="Staff/ บุคลากร">Staff/ บุคลากร</option>
            <option value="Faculty/ อาจารย์">Faculty/ อาจารย์</option>
          </select>
        </FormField> */}

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* <FormField error={errors.pubFaculty} htmlFor="pubFaculty" label="Faculty *">
            <select
              id="pubFaculty"
              value={value.faculty}
              onChange={(e) => {
                const v = e.target.value;
                set(v !== OTHER_FACULTY ? { faculty: v, facultyOther: "" } : { faculty: v });
                clearError("pubFaculty");
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
          </FormField> */}

          {value.faculty === OTHER_FACULTY && (
            <FormField
              error={errors.pubFacultyOther}
              htmlFor="pubFacultyOther"
              label="คณะอื่น ๆ (โปรดระบุ) Other Faculties (please specify)"
            >
              <input
                id="pubFacultyOther"
                type="text"
                placeholder="ระบุคณะ/หน่วยงานของคุณ"
                value={value.facultyOther}
                onChange={(e) => {
                  set({ facultyOther: e.target.value });
                  clearError("pubFacultyOther");
                }}
              />
            </FormField>
          )}
        </div>

        {/* <FormField error={errors.pubTel} htmlFor="pubTel" label="เบอร์โทรศัพท์ (Telephone) *">
          <input
            id="pubTel"
            type="tel"
            placeholder="กรอกเบอร์โทรศัพท์"
            value={value.telephone}
            onChange={(e) => {
              set({ telephone: e.target.value });
              clearError("pubTel");
            }}
          />
        </FormField>
      </div> */}

      {/* <div className="form-grid" style={{ marginTop: "18px" }}>
        <FormField error={errors.pubWorkTitle} htmlFor="pubWorkTitle" label="ชื่อผลงาน (Work Title) *">
          <input
            id="pubWorkTitle"
            type="text"
            placeholder="กรอกชื่อผลงาน/หนังสือ/ตำรา"
            value={value.workTitle}
            onChange={(e) => {
              set({ workTitle: e.target.value });
              clearError("pubWorkTitle");
            }}
          />
        </FormField> */}

        {/* <FormField error={errors.pubWorkType} htmlFor="pubWorkType" label="ประเภทผลงาน (Work Type) *">
          <select
            id="pubWorkType"
            value={value.workType}
            onChange={(e) => {
              set({ workType: e.target.value });
              clearError("pubWorkType");
            }}
          >
            <option value="">เลือกประเภทผลงาน</option>
            {WORK_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField> */}

        {/* <FormField error={errors.pubAuthor} htmlFor="pubAuthor" label="ชื่อเจ้าของผลงาน/ผู้แต่ง (Author) *">
          <input
            id="pubAuthor"
            type="text"
            placeholder="กรอกชื่อเจ้าของผลงาน/ผู้แต่ง"
            value={value.author}
            onChange={(e) => {
              set({ author: e.target.value });
              clearError("pubAuthor");
            }}
          />
        </FormField> */}

        {/* <FormField error={errors.pubYear} htmlFor="pubYear" label="ปีที่จัดทำ (Year)">
          <input
            id="pubYear"
            type="text"
            placeholder="เช่น 2568"
            value={value.year}
            onChange={(e) => {
              set({ year: e.target.value });
              clearError("pubYear");
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

export const publishDeliveryForm: ServiceFormModule<PublishDeliveryValue> = {
  type: "บริการนำส่งเผยแพร่ผลงาน หนังสือ ตำรา",

  emptyValue: {
    staffStudentId: "",
    status: "",
    faculty: "",
    facultyOther: "",
    telephone: "",
    workTitle: "",
    workType: "",
    author: "",
    year: "",
    description: ""
  },

  fromRequest: (request) => ({
    staffStudentId: request.pubStaffStudentId || "",
    status: request.pubStatus || "",
    faculty: request.pubFaculty || "",
    facultyOther: request.pubFacultyOther || "",
    telephone: request.pubTelephone || "",
    workTitle: request.pubWorkTitle || "",
    workType: request.pubWorkType || "",
    author: request.pubAuthor || "",
    year: request.pubYear || "",
    description: request.pubDescription || ""
  }),

  validate: (value) => {
    const errors: Record<string, string> = {};
    if (!value.staffStudentId.trim()) errors.pubId = "กรุณากรอกรหัสนักศึกษา/พนักงาน";
    if (!value.status) errors.pubStatus = "กรุณาเลือกสถานภาพ";
    if (!value.faculty) {
      errors.pubFaculty = "กรุณาเลือกคณะ";
    } else if (value.faculty === OTHER_FACULTY && !value.facultyOther.trim()) {
      errors.pubFacultyOther = "กรุณาระบุคณะ/หน่วยงาน";
    }
    if (!value.telephone.trim()) errors.pubTel = "กรุณากรอกเบอร์โทรศัพท์";
    if (!value.workTitle.trim()) errors.pubWorkTitle = "กรุณากรอกชื่อผลงาน";
    if (!value.workType) errors.pubWorkType = "กรุณาเลือกประเภทผลงาน";
    if (!value.author.trim()) errors.pubAuthor = "กรุณากรอกชื่อเจ้าของผลงาน/ผู้แต่ง";
    return errors;
  },

  buildPayload: (value) => ({
    detail: `Work: ${value.workTitle} (${value.workType}) - ${value.author}`,
    extra: {
      pubStaffStudentId: value.staffStudentId,
      pubStatus: value.status,
      pubFaculty: value.faculty,
      pubFacultyOther: value.facultyOther || null,
      pubTelephone: value.telephone,
      pubWorkTitle: value.workTitle,
      pubWorkType: value.workType,
      pubAuthor: value.author,
      pubYear: value.year || null,
      pubDescription: value.description || null
    }
  }),

  Form: PublishDeliveryForm
};
