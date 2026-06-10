import { Router } from "express";
import { authRepository } from "./auth.repository.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body as {
      username?: string;
      password?: string;
    };

    if (!username?.trim() || !password?.trim()) {
      res.status(400).json({ message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" });
      return;
    }

    const user = await authRepository.findByCredentials(
      username.trim(),
      password.trim()
    );

    if (!user) {
      res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});
