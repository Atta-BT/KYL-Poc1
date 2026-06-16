import { Fragment, useState } from "react";
import { Pencil, Eye, EyeOff, Send } from "lucide-react";
import { Link } from "react-router-dom";
import {
  REQUEST_STATUSES,
  REQUEST_STATUS_META,
  REQUEST_TYPE_COLORS,
  type RequestStatus,
  type RequestType,
  type ServiceRequest
} from "../types";
import { formatDateTime } from "../utils";

type RequestTableProps = {
  requests: ServiceRequest[];
  isAdmin?: boolean;
  onStatusChange?: (id: string, status: RequestStatus) => void | Promise<void>;
  onReply?: (id: string, reply: string) => void | Promise<void>;
};

/** Admin reply: shown to everyone; editable inline by admins. */
const ReplySection = ({
  request,
  isAdmin,
  onReply
}: {
  request: ServiceRequest;
  isAdmin: boolean;
  onReply?: (id: string, reply: string) => void | Promise<void>;
}) => {
  const [draft, setDraft] = useState(request.adminReply ?? "");
  const [isSending, setIsSending] = useState(false);

  const hasReply = Boolean(request.adminReply && request.adminReply.trim());

  const submit = async () => {
    if (!onReply || !draft.trim()) return;
    setIsSending(true);
    try {
      await onReply(request.id, draft.trim());
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="reply-section">
      <h4>การตอบกลับจากเจ้าหน้าที่</h4>

      {hasReply ? (
        <div className="reply-message">
          <p className="reply-text">{request.adminReply}</p>
          <div className="reply-meta">
            {request.adminReplyBy ? <span>โดย {request.adminReplyBy}</span> : null}
            {request.adminReplyAt ? (
              <span>{formatDateTime(request.adminReplyAt)}</span>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="reply-empty">ยังไม่มีการตอบกลับ</p>
      )}

      {isAdmin && onReply ? (
        <div className="reply-editor">
          <textarea
            rows={3}
            placeholder="พิมพ์ข้อความตอบกลับถึงผู้ส่งคำขอ"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button
            type="button"
            className="button button--primary"
            disabled={isSending || !draft.trim()}
            onClick={() => void submit()}
          >
            <Send size={16} />
            {hasReply ? "อัปเดตคำตอบ" : "ส่งคำตอบ"}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export const RequestTable = ({
  requests,
  isAdmin = false,
  onStatusChange,
  onReply
}: RequestTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStatusChange = async (id: string, status: RequestStatus) => {
    if (!onStatusChange) return;
    setUpdatingId(id);
    try {
      await onStatusChange(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const renderStatus = (request: ServiceRequest) => {
    const meta = REQUEST_STATUS_META[request.status];

    if (isAdmin && onStatusChange) {
      return (
        <select
          className="status-select"
          value={request.status}
          disabled={updatingId === request.id}
          onChange={(event) =>
            void handleStatusChange(
              request.id,
              event.target.value as RequestStatus
            )
          }
          style={
            meta
              ? {
                  background: meta.bg,
                  color: meta.color,
                  borderColor: meta.border
                }
              : undefined
          }
        >
          {REQUEST_STATUSES.map((status) => (
            <option key={status} value={status}>
              {REQUEST_STATUS_META[status].label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <span
        className="status-chip"
        style={
          meta
            ? {
                background: meta.bg,
                color: meta.color,
                borderColor: meta.border
              }
            : undefined
        }
      >
        {meta ? meta.label : request.status}
      </span>
    );
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
            <strong>คณะ (Faculty):</strong> {request.fulltextFaculty === "อื่นๆ (โปรดระบุ)" ? `อื่นๆ (${request.fulltextFacultyOther || "-"})` : (request.fulltextFaculty || "-")}
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
            <strong>คณะ (Faculty):</strong> {request.deliveryFaculty === "อื่นๆ (โปรดระบุ)" ? `อื่นๆ (${request.deliveryFacultyOther || "-"})` : (request.deliveryFaculty || "-")}
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

    if (request.requestType === "บริการยืมระหว่างห้องสมุด") {
      return (
        <div className="detail-grid">
          <div>
            <strong>รหัสประจำตัว (Staff/Student ID):</strong> {request.illStaffStudentId || "-"}
          </div>
          <div>
            <strong>สถานภาพ (Status):</strong> {request.illStatus || "-"}
          </div>
          <div>
            <strong>คณะ (Faculty):</strong> {request.illFaculty === "อื่นๆ (โปรดระบุ)" ? `อื่นๆ (${request.illFacultyOther || "-"})` : (request.illFaculty || "-")}
          </div>
          <div>
            <strong>เบอร์โทรศัพท์ (Telephone):</strong> {request.illTelephone || "-"}
          </div>
          <div className="full-width">
            <strong>ชื่อทรัพยากร (Title):</strong> {request.illResourceTitle || "-"}
          </div>
          <div>
            <strong>ผู้แต่ง (Author):</strong> {request.illAuthor || "-"}
          </div>
          <div>
            <strong>ประเภททรัพยากร (Item Type):</strong> {request.illItemType || "-"}
          </div>
          <div>
            <strong>ห้องสมุด/สถาบันต้นทาง:</strong> {request.illSourceLibrary || "-"}
          </div>
          <div>
            <strong>วันที่ต้องการใช้ (Need By):</strong> {request.illNeedByDate || "-"}
          </div>
        </div>
      );
    }

    if (request.requestType === "บริการนำส่งเผยแพร่ผลงาน หนังสือ ตำรา") {
      return (
        <div className="detail-grid">
          <div>
            <strong>รหัสประจำตัว (Staff/Student ID):</strong> {request.pubStaffStudentId || "-"}
          </div>
          <div>
            <strong>สถานภาพ (Status):</strong> {request.pubStatus || "-"}
          </div>
          <div>
            <strong>คณะ (Faculty):</strong> {request.pubFaculty === "อื่นๆ (โปรดระบุ)" ? `อื่นๆ (${request.pubFacultyOther || "-"})` : (request.pubFaculty || "-")}
          </div>
          <div>
            <strong>เบอร์โทรศัพท์ (Telephone):</strong> {request.pubTelephone || "-"}
          </div>
          <div className="full-width">
            <strong>ชื่อผลงาน (Work Title):</strong> {request.pubWorkTitle || "-"}
          </div>
          <div>
            <strong>ประเภทผลงาน (Work Type):</strong> {request.pubWorkType || "-"}
          </div>
          <div>
            <strong>เจ้าของผลงาน/ผู้แต่ง (Author):</strong> {request.pubAuthor || "-"}
          </div>
          <div>
            <strong>ปีที่จัดทำ (Year):</strong> {request.pubYear || "-"}
          </div>
          <div className="full-width">
            <strong>รายละเอียด/บทคัดย่อ:</strong> {request.pubDescription || "-"}
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
            <th>สถานะ</th>
            <th>วันที่สร้าง</th>
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
                  <td data-label="สถานะ">{renderStatus(request)}</td>
                  <td data-label="วันที่สร้าง">
                    {formatDateTime(request.createdAt)}
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
                    <td colSpan={8}>
                      <div className="detail-card">
                        <h4>ข้อมูลรายละเอียดคำขอแบบครบถ้วน</h4>
                        {renderDetails(request)}
                        <ReplySection
                          request={request}
                          isAdmin={isAdmin}
                          onReply={onReply}
                        />
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

