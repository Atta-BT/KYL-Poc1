import {
  ChevronDown,
  FilePlus2,
  LibraryBig,
  LogOut,
  User
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

type ShellProps = {
  children: ReactNode;
};

export const Shell = ({ children }: ShellProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const showNav = pathname.startsWith("/requests");

  const isAuthenticated = sessionStorage.getItem("kyl-authenticated") === "true";
  const userJson = sessionStorage.getItem("kyl-user");
  const user = userJson ? (JSON.parse(userJson) as { fullName: string; role?: string }) : null;

  const handleLogout = () => {
    sessionStorage.removeItem("kyl-authenticated");
    sessionStorage.removeItem("kyl-login-center");
    sessionStorage.removeItem("kyl-user");
    navigate("/");
  };

  const isInterviewPage = pathname === "/" || pathname === "/interview";

  return (
  <div className="app-shell">
    {/* Top utility bar */}
    <div className="app-topbar">
      {(!isAuthenticated || (isInterviewPage && user && ["admin", "staff", "student"].includes(user.role ?? ""))) && (
        <div className="topbar-dropdown">
          <button className="topbar-dropdown__trigger" type="button">
            บุคลากร/นักศึกษา <ChevronDown size={13} />
          </button>
          <div className="topbar-dropdown__panel" role="menu">
            <Link
              className="topbar-dropdown__item"
              role="menuitem"
              to="/login?center=learning-request-center&returnTo=/requests"
            >
              Learning Request Center
            </Link>
            <Link
              className="topbar-dropdown__item"
              role="menuitem"
              to="/login?center=digital-collection&returnTo=/requests"
            >
              Digital Collection Center
            </Link>
          </div>
        </div>
      )}

      {(!isAuthenticated || (isInterviewPage && user && user.role === "user")) && (
        <div className="topbar-dropdown">
          <button className="topbar-dropdown__trigger" type="button">
            ผู้ใช้บริการทั่วไป <ChevronDown size={13} />
          </button>
          <div className="topbar-dropdown__panel topbar-dropdown__panel--right" role="menu">
            <Link
              className="topbar-dropdown__item"
              role="menuitem"
              to="/login?center=public-service&returnTo=/requests"
            >
              Learning Request Center
            </Link>
          </div>
        </div>
      )}

      {isAuthenticated && user && (
        <>
          <div className="topbar-user">
            <User size={14} />
            <span>{user.fullName}</span>
          </div>
          <button className="topbar-logout" onClick={handleLogout} type="button">
            <LogOut size={14} />
            <span>ออกจากระบบ</span>
          </button>
        </>
      )}
    </div>

    {/* Main header */}
    <header className="app-header">
      <Link className="brand" to="/">
        <div className="brand__mark" aria-hidden="true">
          <LibraryBig size={26} />
        </div>
        <div>
          <p>KHUNYING LONG ATHAKRAVISUNTHORN</p>
          <h1>Learning Resources Center</h1>
        </div>
      </Link>
      {showNav && (
        <nav className="app-nav" aria-label="main navigation">
          <NavLink to="/requests">
            รายการ Request
          </NavLink>
          <NavLink to="/requests/new">
            <FilePlus2 size={16} />
            เพิ่ม Request
          </NavLink>
        </nav>
      )}
    </header>

    <main className="app-main">{children}</main>

    {/* Footer */}
    <footer className="app-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand-row">
            <LibraryBig size={26} />
            <span>KYL Learning Resources Center</span>
          </div>
          <p>15 มหาวิทยาลัยสงขลานครินทร์<br />ถนนกาญจนวณิชย์ ต.คอหงส์<br />อ.หาดใหญ่ สงขลา 90110</p>
          <p>kyl.library@psu.ac.th</p>
        </div>
        <div>
          <h4>เวลาทำการ</h4>
          <p>จันทร์–ศุกร์ 08.30–20.00 น.</p>
          <p>เสาร์–อาทิตย์ 09.00–18.00 น.</p>
          <p>วันหยุดนักขัตฤกษ์ ปิดให้บริการ</p>
        </div>
        <div>
          <h4>ติดต่อสอบถาม</h4>
          <p>เคาน์เตอร์บริการ<br />โทร. 0-7428-2352</p>
          <p>สายตรงผู้อำนวยการ<br />โทร. 0-7428-2375</p>
          <p><a href="https://lib.psu.ac.th" target="_blank" rel="noopener noreferrer">lib.psu.ac.th</a></p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} สำนักทรัพยากรการเรียนรู้คุณหญิงหลงฯ มหาวิทยาลัยสงขลานครินทร์</span>
        <a href="https://lib.psu.ac.th" target="_blank" rel="noopener noreferrer">lib.psu.ac.th</a>
      </div>
    </footer>
  </div>
  );
};
