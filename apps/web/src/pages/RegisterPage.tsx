import { LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components";
import { register, ApiError } from "../api";

export const RegisterPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("kyl-authenticated") === "true";
    if (isAuthenticated) {
      navigate("/requests", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim() || !fullName.trim() || !email.trim()) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsLoading(true);

    try {
      const { user } = await register({
        username: username.trim(),
        password: password.trim(),
        fullName: fullName.trim(),
        email: email.trim()
      });

      sessionStorage.setItem("kyl-authenticated", "true");
      sessionStorage.setItem("kyl-login-center", "public-service");
      sessionStorage.setItem("kyl-user", JSON.stringify(user));

      navigate("/requests", { replace: true });
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
      } else {
        setError("ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-hero">
        <p className="eyebrow">KYL Learning Resources Center</p>
        <h2>สมัครสมาชิกผู้ใช้บริการทั่วไป</h2>
        <p>
          สร้างบัญชีใหม่เพื่อเข้าสู่ระบบและเริ่มทำรายการคำร้องต่าง ๆ ผ่านบริการของหอสมุดคุณหญิงหลงฯ
        </p>

        <div className="auth-hero__badge">
          <UserPlus size={18} />
          <span>ผู้ใช้บริการทั่วไป</span>
        </div>
      </div>

      <section className="panel auth-card">
        <div className="auth-card__header">
          <p className="eyebrow">ลงทะเบียน</p>
          <h3>สร้างบัญชีผู้ใช้งานทั่วไป</h3>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>ชื่อผู้ใช้</span>
            <input
              autoComplete="username"
              disabled={isLoading}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="กรอกชื่อผู้ใช้สำหรับ Login"
              type="text"
              value={username}
            />
          </label>

          <label className="auth-field">
            <span>รหัสผ่าน</span>
            <input
              autoComplete="new-password"
              disabled={isLoading}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="กรอกรหัสผ่าน"
              type="password"
              value={password}
            />
          </label>

          <label className="auth-field">
            <span>ชื่อ-นามสกุล</span>
            <input
              disabled={isLoading}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="กรอกชื่อและนามสกุลจริง"
              type="text"
              value={fullName}
            />
          </label>

          <label className="auth-field">
            <span>อีเมล</span>
            <input
              autoComplete="email"
              disabled={isLoading}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="กรอกอีเมลติดต่อ (e.g. user@example.com)"
              type="email"
              value={email}
            />
          </label>

          {error ? <div className="alert alert--error">{error}</div> : null}

          <div className="auth-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link to="/login?center=public-service" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--primary)" }}>
              <LogIn size={16} /> มีบัญชีผู้ใช้งานแล้ว? เข้าสู่ระบบ
            </Link>
            <Button
              disabled={isLoading}
              icon={<UserPlus size={18} />}
              type="submit"
              variant="primary"
            >
              {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </Button>
          </div>
        </form>
      </section>
    </section>
  );
};
