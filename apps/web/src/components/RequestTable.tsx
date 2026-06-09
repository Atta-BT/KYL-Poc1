import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { REQUEST_TYPE_COLORS, type RequestType, type ServiceRequest } from "../types";
import { formatDateTime } from "../utils";

type RequestTableProps = {
  requests: ServiceRequest[];
};

export const RequestTable = ({ requests }: RequestTableProps) => (
  <div className="table-wrap">
    <table className="request-table">
      <thead>
        <tr>
          <th>เลขที่ Request</th>
          <th>หัวข้อ</th>
          <th>ประเภท</th>
          <th>ผู้ส่งคำขอ</th>
          <th>อีเมล</th>
          <th>วันที่สร้าง</th>
          <th aria-label="actions" />
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => {
          const chipColors =
            REQUEST_TYPE_COLORS[request.requestType as RequestType];
          return (
          <tr key={request.id}>
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
            <td data-label="วันที่สร้าง">{formatDateTime(request.createdAt)}</td>
            <td className="table-actions">
              <Link
                aria-label={`แก้ไข ${request.requestNo}`}
                className="icon-link"
                to={`/requests/${request.id}/edit`}
                title="แก้ไข"
              >
                <Pencil size={18} />
                <span>แก้ไข</span>
              </Link>
            </td>
          </tr>
        );
        })}
      </tbody>
    </table>
  </div>
);

