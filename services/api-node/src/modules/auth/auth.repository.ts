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
    email: string,
    password: string
  ): Promise<AuthUser | null> {
    const result = await pool.query<UserRow>(
      `SELECT * FROM users WHERE email = $1 AND password = $2`,
      [email, password]
    );

    return result.rows[0] ? toAuthUser(result.rows[0]) : null;
  },

  async findByUsername(username: string): Promise<AuthUser | null> {
    const result = await pool.query<UserRow>(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );

    return result.rows[0] ? toAuthUser(result.rows[0]) : null;
  },

  async create(user: Omit<AuthUser, "id"> & { password: string }): Promise<AuthUser> {
    const result = await pool.query<UserRow>(
      `INSERT INTO users (username, password, full_name, email, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user.username, user.password, user.fullName, user.email, user.role]
    );

    return toAuthUser(result.rows[0]);
  }
};
