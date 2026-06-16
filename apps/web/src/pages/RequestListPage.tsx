import { Filter, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, EmptyState, Pagination, RequestTable } from "../components";
import { listRequests, updateRequestStatus, replyToRequest } from "../api";
import {
  REQUEST_STATUSES,
  REQUEST_STATUS_META,
  REQUEST_TYPES,
  type RequestStatus,
  type RequestType,
  type ServiceRequest
} from "../types";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 400;

export const RequestListPage = () => {
  const navigate = useNavigate();

  const userJson = sessionStorage.getItem("kyl-user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user?.role === "admin";

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [type, setType] = useState<RequestType | "">("");
  const [status, setStatus] = useState<RequestStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listRequests({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
        type: type || undefined,
        status: status || undefined
      });

      setRequests(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "ไม่สามารถโหลดรายการ Request ได้"
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, type, status]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleTypeChange = (value: RequestType | "") => {
    setPage(1);
    setType(value);
  };

  const handleStatusFilterChange = (value: RequestStatus | "") => {
    setPage(1);
    setStatus(value);
  };

  const handleStatusChange = async (id: string, next: RequestStatus) => {
    try {
      await updateRequestStatus(id, next);
      await loadRequests();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "ไม่สามารถอัปเดตสถานะได้"
      );
    }
  };

  const handleReply = async (id: string, reply: string) => {
    try {
      await replyToRequest(id, reply);
      await loadRequests();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "ไม่สามารถบันทึกคำตอบได้"
      );
    }
  };



  return (
    <section className="page-stack">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">KYL Learning Resources Center</p>
          <h2>รายการ Request</h2>
        </div>
        <Link className="button button--primary" to="/requests/new">
          เพิ่ม Request
        </Link>
      </div>

      <section className="panel">
        <div className="toolbar">
          <label className="search-box">
            <Search size={18} aria-hidden="true" />
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาเลขที่ หัวข้อ ชื่อ หรืออีเมล"
              type="search"
              value={search}
            />
          </label>

          <label className="filter-select">
            <Filter size={18} aria-hidden="true" />
            <select
              onChange={(event) =>
                handleTypeChange(event.target.value as RequestType | "")
              }
              value={type}
            >
              <option value="">ประเภท Request</option>
              {REQUEST_TYPES.map((requestType) => (
                <option key={requestType} value={requestType}>
                  {requestType}
                </option>
              ))}
            </select>
          </label>

          {isAdmin && (
            <label className="filter-select">
              <Filter size={18} aria-hidden="true" />
              <select
                onChange={(event) =>
                  handleStatusFilterChange(event.target.value as RequestStatus | "")
                }
                value={status}
              >
                <option value="">ประเภท สถานะ</option>
                {REQUEST_STATUSES.map((requestStatus) => (
                  <option key={requestStatus} value={requestStatus}>
                    {REQUEST_STATUS_META[requestStatus].label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {error ? <div className="alert alert--error">{error}</div> : null}

        {isLoading ? (
          <div className="loading-block">กำลังโหลดรายการ Request</div>
        ) : requests.length > 0 ? (
          <>
            <RequestTable
              requests={requests}
              isAdmin={isAdmin}
              onStatusChange={handleStatusChange}
              onReply={handleReply}
            />
            <Pagination
              onPageChange={setPage}
              page={page}
              total={total}
              totalPages={totalPages}
            />
          </>
        ) : (
          <EmptyState
            message="ยังไม่มีรายการที่ตรงกับเงื่อนไข"
            title="ไม่พบ Request"
          />
        )}
      </section>
    </section>
  );
};
