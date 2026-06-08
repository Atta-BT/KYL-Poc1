import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export const Pagination = ({
  page,
  totalPages,
  onPageChange
}: PaginationProps) => (
  <div className="pagination" aria-label="pagination">
    <Button
      disabled={page <= 1}
      icon={<ChevronLeft size={18} />}
      onClick={() => onPageChange(page - 1)}
      variant="ghost"
    >
      ก่อนหน้า
    </Button>
    <span className="pagination__status">
      หน้า {page} / {totalPages}
    </span>
    <Button
      disabled={page >= totalPages}
      icon={<ChevronRight size={18} />}
      onClick={() => onPageChange(page + 1)}
      variant="ghost"
    >
      ถัดไป
    </Button>
  </div>
);

