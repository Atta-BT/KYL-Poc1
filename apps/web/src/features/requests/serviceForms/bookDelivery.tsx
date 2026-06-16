import { FormField } from "../../../components";
import type { ServiceFormModule, ServiceFormProps } from "./types";
import { FACULTIES, OTHER_FACULTY } from "./facultyOptions";

export interface BookDeliveryValue {
  staffStudentId: string;
  status: string;
  faculty: string;
  facultyOther: string;
  bookTitle: string;
  lcCall: string;
  collection: string;
}

const COLLECTION_OPTIONS = [
  "หนังสือภาษาไทย (Thai Book Collection)",
  "หนังสือภาษาต่างประเทศ (Foreign Book Collection)",
  "วิทยานิพนธ์และวิจัย (Theses & Research)",
  "หนังสืออ้างอิง (Reference Books)",
  "สิ่งพิมพ์พิเศษ (Special Publications)"
];

const BookDeliveryForm = ({
  value,
  onChange,
  errors,
  clearError
}: ServiceFormProps<BookDeliveryValue>) => {
  const set = (patch: Partial<BookDeliveryValue>) =>
    onChange({ ...value, ...patch });

  return (
    <>
      <div className="form-grid" style={{ marginTop: "18px" }}>
        <FormField error={errors.delId} htmlFor="delId" label="Staff ID/ Student ID/ Other *">
          <input
            id="delId"
            type="text"
            placeholder="กรอกรหัสประจำตัว"
            value={value.staffStudentId}
            onChange={(e) => {
              set({ staffStudentId: e.target.value });
              clearError("delId");
            }}
          />
        </FormField>

        <FormField error={errors.delStatus} htmlFor="delStatus" label="Status *">
          <select
            id="delStatus"
            value={value.status}
            onChange={(e) => {
              set({ status: e.target.value });
              clearError("delStatus");
            }}
          >
            <option value="">เลือกสถานภาพ</option>
            <option value="Student/ นักศึกษา">Student/ นักศึกษา</option>
            <option value="Staff/ บุคลากร">Staff/ บุคลากร</option>
            <option value="Faculty/ อาจารย์">Faculty/ อาจารย์</option>
          </select>
        </FormField>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <FormField error={errors.delFaculty} htmlFor="delFaculty" label="Faculty *">
            <select
              id="delFaculty"
              value={value.faculty}
              onChange={(e) => {
                const v = e.target.value;
                set(v !== OTHER_FACULTY ? { faculty: v, facultyOther: "" } : { faculty: v });
                clearError("delFaculty");
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
              error={errors.delFacultyOther}
              htmlFor="delFacultyOther"
              label="คณะอื่น ๆ (โปรดระบุ) Other Faculties (please specify)"
            >
              <input
                id="delFacultyOther"
                type="text"
                placeholder="ระบุคณะ/หน่วยงานของคุณ"
                value={value.facultyOther}
                onChange={(e) => {
                  set({ facultyOther: e.target.value });
                  clearError("delFacultyOther");
                }}
              />
            </FormField>
          )}
        </div>
      </div>

      <div className="form-grid" style={{ marginTop: "18px" }}>
        <FormField error={errors.delBookTitle} htmlFor="delBookTitle" label="Book Title *">
          <input
            id="delBookTitle"
            type="text"
            placeholder="กรอกชื่อหนังสือ"
            value={value.bookTitle}
            onChange={(e) => {
              set({ bookTitle: e.target.value });
              clearError("delBookTitle");
            }}
          />
        </FormField>

        <FormField error={errors.delLcCall} htmlFor="delLcCall" label="LC Call *">
          <input
            id="delLcCall"
            type="text"
            placeholder="กรอกเลขเรียกหนังสือ (เช่น QA76.73.J38)"
            value={value.lcCall}
            onChange={(e) => {
              set({ lcCall: e.target.value });
              clearError("delLcCall");
            }}
          />
        </FormField>

        <FormField error={errors.delCollection} htmlFor="delCollection" label="Collection *">
          <select
            id="delCollection"
            value={value.collection}
            onChange={(e) => {
              set({ collection: e.target.value });
              clearError("delCollection");
            }}
          >
            <option value="">เลือก Collection</option>
            {COLLECTION_OPTIONS.map((collection) => (
              <option key={collection} value={collection}>
                {collection}
              </option>
            ))}
          </select>
        </FormField>
      </div>
    </>
  );
};

export const bookDeliveryForm: ServiceFormModule<BookDeliveryValue> = {
  type: "บริการนำส่งหนังสือ (Book Delivery)",

  emptyValue: {
    staffStudentId: "",
    status: "",
    faculty: "",
    facultyOther: "",
    bookTitle: "",
    lcCall: "",
    collection: ""
  },

  fromRequest: (request) => ({
    staffStudentId: request.deliveryStaffStudentId || "",
    status: request.deliveryStatus || "",
    faculty: request.deliveryFaculty || "",
    facultyOther: request.deliveryFacultyOther || "",
    bookTitle: request.deliveryBookTitle || "",
    lcCall: request.deliveryLcCall || "",
    collection: request.deliveryCollection || ""
  }),

  validate: (value) => {
    const errors: Record<string, string> = {};
    if (!value.staffStudentId.trim()) errors.delId = "กรุณากรอกรหัสนักศึกษา/พนักงาน";
    if (!value.status) errors.delStatus = "กรุณาเลือกสถานภาพ";
    if (!value.faculty) {
      errors.delFaculty = "กรุณาเลือกคณะ";
    } else if (value.faculty === OTHER_FACULTY && !value.facultyOther.trim()) {
      errors.delFacultyOther = "กรุณาระบุคณะ/หน่วยงาน";
    }
    if (!value.bookTitle.trim()) errors.delBookTitle = "กรุณากรอกชื่อหนังสือ";
    if (!value.lcCall.trim()) errors.delLcCall = "กรุณากรอก LC Call Number";
    if (!value.collection) errors.delCollection = "กรุณาเลือก Collection";
    return errors;
  },

  buildPayload: (value) => ({
    detail: `Book Title: ${value.bookTitle}, Call Number: ${value.lcCall}`,
    extra: {
      deliveryStaffStudentId: value.staffStudentId,
      deliveryStatus: value.status,
      deliveryFaculty: value.faculty,
      deliveryFacultyOther: value.facultyOther || null,
      deliveryBookTitle: value.bookTitle,
      deliveryLcCall: value.lcCall,
      deliveryCollection: value.collection
    }
  }),

  Form: BookDeliveryForm
};
