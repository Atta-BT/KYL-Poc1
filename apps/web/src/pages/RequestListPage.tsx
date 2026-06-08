import { Filter, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Pagination } from "../components/Pagination";
import { RequestTable } from "../components/RequestTable";
import { listRequests } from "../api/requests";
import {
  REQUEST_TYPES,
  type RequestType,
  type ServiceRequest
} from "../types/request";

const PAGE_SIZE = 10;

export const RequestListPage = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [type, setType] = useState<RequestType | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listRequests({
        page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        type: type || undefined
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
  }, [page, search, type]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const summary = useMemo(
    () => [
      { label: "ทั้งหมด", value: total.toLocaleString("th-TH") },
      { label: "ต่อหน้า", value: PAGE_SIZE.toLocaleString("th-TH") },
      { label: "หน้าปัจจุบัน", value: page.toLocaleString("th-TH") }
    ],
    [page, total]
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(draftSearch.trim());
  };

  const handleTypeChange = (value: RequestType | "") => {
    setPage(1);
    setType(value);
  };

  return (
    <section className="page-stack">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Integrated Service Platform</p>
          <h2>รายการ Request</h2>
        </div>
        <Link className="button button--primary" to="/requests/new">
          เพิ่ม Request
        </Link>
      </div>

      <div className="summary-grid">
        {summary.map((item) => (
          <div className="summary-item" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="toolbar">
          <form className="search-form" onSubmit={handleSearch}>
            <label className="search-box">
              <Search size={18} aria-hidden="true" />
              <input
                onChange={(event) => setDraftSearch(event.target.value)}
                placeholder="ค้นหาเลขที่ หัวข้อ ชื่อ หรืออีเมล"
                type="search"
                value={draftSearch}
              />
            </label>
            <Button icon={<Search size={18} />} type="submit" variant="primary">
              ค้นหา
            </Button>
          </form>

          <label className="filter-select">
            <Filter size={18} aria-hidden="true" />
            <select
              onChange={(event) =>
                handleTypeChange(event.target.value as RequestType | "")
              }
              value={type}
            >
              <option value="">ทุกประเภท</option>
              {REQUEST_TYPES.map((requestType) => (
                <option key={requestType} value={requestType}>
                  {requestType}
                </option>
              ))}
            </select>
          </label>

          <Button
            icon={<RefreshCw size={18} />}
            onClick={() => void loadRequests()}
            variant="ghost"
          >
            รีเฟรช
          </Button>
        </div>

        {error ? <div className="alert alert--error">{error}</div> : null}

        {isLoading ? (
          <div className="loading-block">กำลังโหลดรายการ Request</div>
        ) : requests.length > 0 ? (
          <>
            <RequestTable requests={requests} />
            <Pagination
              onPageChange={setPage}
              page={page}
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
