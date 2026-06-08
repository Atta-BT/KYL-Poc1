import { FilePlus2, LibraryBig } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

type ShellProps = {
  children: ReactNode;
};

export const Shell = ({ children }: ShellProps) => (
  <div className="app-shell">
    <header className="app-header">
      <div className="brand">
        <div className="brand__mark" aria-hidden="true">
          <LibraryBig size={24} />
        </div>
        <div>
          <p>สำนักทรัพยากรการเรียนรู้ฯ</p>
          <h1>Request Management</h1>
        </div>
      </div>
      <nav className="app-nav" aria-label="main navigation">
        <NavLink to="/" end>
          รายการ Request
        </NavLink>
        <NavLink to="/requests/new">
          <FilePlus2 size={18} />
          เพิ่ม Request
        </NavLink>
      </nav>
    </header>
    <main className="app-main">{children}</main>
  </div>
);

