import { LogIn, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components";
import { login, ApiError } from "../api";

const centerLabels: Record<string, string> = {
  "learning-request-center": "Learning Request Center",
  "public-service": "ผู้ใช้บริการทั่วไป"
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const center = searchParams.get("center") ?? "learning-request-center";
  const returnTo = searchParams.get("returnTo") ?? "/requests";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("kyl-authenticated") === "true";
    const userJson = sessionStorage.getItem("kyl-user");
    const user = userJson ? JSON.parse(userJson) : null;

    if (isAuthenticated && user) {
      const isStaffOrStudentCenter = center === "learning-request-center" || center === "digital-collection";
      const isPublicServiceCenter = center === "public-service";

      const isValid = (isStaffOrStudentCenter && ["admin", "staff", "student"].includes(user.role)) ||
                      (isPublicServiceCenter && user.role === "user");

      if (isValid) {
        navigate(returnTo, { replace: true });
      } else {
        sessionStorage.removeItem("kyl-authenticated");
        sessionStorage.removeItem("kyl-login-center");
        sessionStorage.removeItem("kyl-user");
      }
    }
  }, [navigate, returnTo, center]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }

    setIsLoading(true);

    try {
      const { user } = await login(username.trim(), password.trim());

      const isStaffOrStudentCenter = center === "learning-request-center" || center === "digital-collection";
      const isPublicServiceCenter = center === "public-service";

      if (isStaffOrStudentCenter && !["admin", "staff", "student"].includes(user.role)) {
        setError("เฉพาะบุคลากรและนักศึกษาเท่านั้นที่สามารถเข้าสู่ระบบผ่านช่องทางนี้");
        setIsLoading(false);
        return;
      }

      if (isPublicServiceCenter && user.role !== "user") {
        setError("เฉพาะผู้ใช้บริการทั่วไปเท่านั้นที่สามารถเข้าสู่ระบบผ่านช่องทางนี้");
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem("kyl-authenticated", "true");
      sessionStorage.setItem("kyl-login-center", center);
      sessionStorage.setItem("kyl-user", JSON.stringify(user));

      navigate(returnTo, { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
      } else {
        setError("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const centerLabel = centerLabels[center] ?? centerLabels["learning-request-center"];

  return (
    <section className="auth-page">
      <div className="auth-hero">
        <p className="eyebrow">KYL Learning Resources Center</p>
        <h2>Learning Request Center</h2>
        <p>
          เลือกศูนย์บริการและเข้าสู่ระบบเพื่อเข้าถึงหน้าเว็บที่สร้างไว้สำหรับ interview
        </p>

        <div className="auth-hero__badge">
          <ShieldCheck size={18} />
          <span>{centerLabel}</span>
        </div>
      </div>

      <section className="panel auth-card">
        <div className="auth-card__header">
          <p className="eyebrow">เข้าสู่ระบบ</p>
          <h3>{centerLabel}</h3>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>ชื่อผู้ใช้</span>
            <input
              autoComplete="username"
              disabled={isLoading}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="กรอกชื่อผู้ใช้"
              type="text"
              value={username}
            />
          </label>

          <label className="auth-field">
            <span>รหัสผ่าน</span>
            <input
              autoComplete="current-password"
              disabled={isLoading}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="กรอกรหัสผ่าน"
              type="password"
              value={password}
            />
          </label>

          {error ? <div className="alert alert--error">{error}</div> : null}

          <div className="auth-actions">
            <Button
              disabled={isLoading}
              icon={<LogIn size={18} />}
              type="submit"
              variant="primary"
            >
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "Login"}
            </Button>
          </div>
        </form>
      </section>
    </section>
  );
};