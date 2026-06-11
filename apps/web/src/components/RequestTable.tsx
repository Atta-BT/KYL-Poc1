import { Fragment, useState } from "react";
import { Pencil, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { REQUEST_TYPE_COLORS, type RequestType, type ServiceRequest } from "../types";
import { formatDateTime } from "../utils";

type RequestTableProps = {
  requests: ServiceRequest[];
};

export const RequestTable = ({ requests }: RequestTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderDetails = (request: ServiceRequest) => {
    if (request.requestType === "บริการตรวจการคัดลอกผลงาน (iThenticate)") {
      return (
        <div className="detail-grid">
          <div>
            <strong>สถานภาพ (Status):</strong> {request.ithenticateStatus || "-"}
          </div>
          <div>
            <strong>คณะ/หน่วยงาน:</strong> {request.ithenticateFaculty === "อื่นๆ (โปรดระบุ)" ? `อื่นๆ (${request.ithenticateFacultyOther || "-"})` : (request.ithenticateFaculty || "-")}
          </div>
          <div>
            <strong>เบอร์โทรศัพท์ติดต่อกลับ:</strong> {request.ithenticateTelephone || "-"}
          </div>
          <div>
            <strong>ต้องการรายงานจาก AI:</strong> {request.ithenticateWantAiReport || "-"}
          </div>
          <div className="full-width">
            <strong>ไฟล์เอกสารที่ต้องการให้ตรวจสอบ:</strong>
            {request.ithenticateFiles && request.ithenticateFiles.length > 0 ? (
              <ul className="detail-files-list">
                {request.ithenticateFiles.map((file, idx) => (
                  <li key={idx}>{file}</li>
                ))}
              </ul>
            ) : (
              " -"
            )}
          </div>
          <div className="full-width">
            <strong>Exclusion Filters:</strong>{" "}
            {request.ithenticateExclusionFilters && request.ithenticateExclusionFilters.length > 0
              ? request.ithenticateExclusionFilters.join(", ")
              : "-"}
          </div>
          <div className="full-width">
            <strong>รายละเอียดเพิ่มเติม:</strong> {request.detail || "-"}
          </div>
        </div>
      );
    }

    if (request.requestType === "บริการ Find Fulltext 4U") {
      return (
        <div className="detail-grid">
          <div>
            <strong>สถานะ (Status):</strong> {request.fulltextStatus || "-"}
          </div>
          <div>
            <strong>คณะ (Faculty):</strong> {request.fulltextFaculty || "-"}
          </div>
          <div>
            <strong>เบอร์โทรศัพท์ติดต่อ:</strong> {request.fulltextTelephone || "-"}
          </div>
          <div>
            <strong>ความต้องการจัดซื้อ:</strong> {request.fulltextPurchaseConsent || "-"}
          </div>
          <div className="full-width">
            <strong>ชื่อบทความ (Article Title):</strong> {request.fulltextArticleTitle || "-"}
          </div>
          <div className="full-width">
            <strong>DOI:</strong> {request.fulltextDoi || "-"}
          </div>
          <div className="full-width">
            <strong>ข้อมูลเพิ่มเติม:</strong> {request.detail || "-"}
          </div>
        </div>
      );
    }

    if (request.requestType === "บริการนำส่งหนังสือ (Book Delivery)") {
      return (
        <div className="detail-grid">
          <div>
            <strong>รหัสประจำตัว (Staff/Student ID):</strong> {request.deliveryStaffStudentId || "-"}
          </div>
          <div>
            <strong>สถานภาพ (Status):</strong> {request.deliveryStatus || "-"}
          </div>
          <div>
            <strong>คณะ (Faculty):</strong> {request.deliveryFaculty || "-"}
          </div>
          <div>
            <strong>Collection:</strong> {request.deliveryCollection || "-"}
          </div>
          <div className="full-width">
            <strong>ชื่อหนังสือ (Book Title):</strong> {request.deliveryBookTitle || "-"}
          </div>
          <div className="full-width">
            <strong>LC Call Number:</strong> {request.deliveryLcCall || "-"}
          </div>
        </div>
      );
    }

    return (
      <div className="detail-grid">
        <div className="full-width">
          <strong>รายละเอียด:</strong> {request.detail || "-"}
        </div>
      </div>
    );
  };

  return (
    <div className="table-wrap">
      <table className="request-table">
        <thead>
          <tr>
            <th>เลขที่ Request</th>
            <th>หัวข้อ</th>
            <th>ประเภท</th>
            <th>ผู้ส่งคำขอ</th>
            <th>อีเมล</th>
            <th aria-label="actions" />
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => {
            const chipColors =
              REQUEST_TYPE_COLORS[request.requestType as RequestType];
            const isExpanded = expandedId === request.id;

            return (
              <Fragment key={request.id}>
                <tr>
                  <td data-label="เลขที่ Request">
                    <span className="request-no">{request.requestNo}</span>
                  </td>
                  <td data-label="หัวข้อ">
                    <span className="table-title">{request.title}</span>
                  </td>
                  <td data-label="ประเภท">
                    <span
                      className="type-chip"
                      style={
                        chipColors
                          ? {
                              background: chipColors.bg,
                              color: chipColors.color,
                              borderColor: chipColors.border
                            }
                          : undefined
                      }
                    >
                      {request.requestType}
                    </span>
                  </td>
                  <td data-label="ผู้ส่งคำขอ">{request.requesterName}</td>
                  <td data-label="อีเมล">
                    <a href={`mailto:${request.requesterEmail}`}>
                      {request.requesterEmail}
                    </a>
                  </td>
                  <td className="table-actions">
                    <div className="table-actions-inner">
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => toggleExpand(request.id)}
                        title="ดูรายละเอียด"
                      >
                        {isExpanded ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <Link
                        aria-label={`แก้ไข ${request.requestNo}`}
                        className="icon-button"
                        to={`/requests/${request.id}/edit`}
                        title="แก้ไข"
                      >
                        <Pencil size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="detail-row">
                    <td colSpan={6}>
                      <div className="detail-card">
                        <h4>ข้อมูลรายละเอียดคำขอแบบครบถ้วน</h4>
                        <div className="detail-meta-group" style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px dashed var(--border)" }}>
                          <strong>วันที่ส่งคำขอ:</strong> {formatDateTime(request.createdAt)}
                        </div>
                        {renderDetails(request)}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

