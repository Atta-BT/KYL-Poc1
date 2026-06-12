import { Router } from "express";
import { authRepository } from "./auth.repository.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email?.trim() || !password?.trim()) {
      res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
      return;
    }

    const user = await authRepository.findByCredentials(
      email.trim(),
      password.trim()
    );

    if (!user) {
      res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      return;
    }

    const ip = (req.headers["x-forwarded-for"] as string) || req.ip || req.socket.remoteAddress || null;
    const userAgent = req.headers["user-agent"] || null;
    try {
      await authRepository.logLogin(user.id, ip, userAgent);
    } catch (logError) {
      console.error("Failed to log user login:", logError);
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const { username, password, fullName, email } = req.body as {
      username?: string;
      password?: string;
      fullName?: string;
      email?: string;
    };

    if (!username?.trim() || !password?.trim() || !fullName?.trim() || !email?.trim()) {
      res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
      return;
    }

    const existingUser = await authRepository.findByUsername(username.trim());
    if (existingUser) {
      res.status(400).json({ message: "ชื่อผู้ใช้นี้มีผู้ใช้งานแล้ว" });
      return;
    }

    const newUser = await authRepository.create({
      username: username.trim(),
      password: password.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      role: "user"
    });

    res.status(201).json({ user: newUser });
  } catch (error) {
    next(error);
  }
});
