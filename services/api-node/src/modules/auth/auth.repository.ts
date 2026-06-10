import { pool } from "../../db/pool.js";

type UserRow = {
  id: string;
  username: string;
  password: string;
  full_name: string;
  email: string;
  role: string;
  created_at: Date;
};

export type AuthUser = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
};

const toAuthUser = (row: UserRow): AuthUser => ({
  id: row.id,
  username: row.username,
  fullName: row.full_name,
  email: row.email,
  role: row.role
});

export const authRepository = {
  async findByCredentials(
    username: string,
    password: string
  ): Promise<AuthUser | null> {
    const result = await pool.query<UserRow>(
      `SELECT * FROM users WHERE username = $1 AND password = $2`,
      [username, password]
    );

    return result.rows[0] ? toAuthUser(result.rows[0]) : null;
  }
};
