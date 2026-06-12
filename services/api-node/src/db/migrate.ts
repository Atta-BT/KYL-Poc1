import { pool } from "./pool.js";

async function main() {
  console.log("Starting database migration...");
  
  const query = `
    CREATE TABLE IF NOT EXISTS book_delivery_requests (
      request_id        uuid PRIMARY KEY REFERENCES service_requests(id) ON DELETE CASCADE,
      staff_student_id  text NOT NULL,
      status            text NOT NULL,
      faculty           text NOT NULL,
      book_title        text NOT NULL,
      lc_call           text NOT NULL,
      collection        text NOT NULL
    );
  `;
  
  await pool.query(query);

  // Alter existing tables if column is missing
  await pool.query(`
    ALTER TABLE fulltext_requests ADD COLUMN IF NOT EXISTS faculty_other text;
    ALTER TABLE book_delivery_requests ADD COLUMN IF NOT EXISTS faculty_other text;
  `);

  // Create login logs table and indexes
  await pool.query(`
    CREATE TABLE IF NOT EXISTS login_logs (
      id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      logged_in_at  timestamptz NOT NULL DEFAULT now(),
      ip_address    text,
      user_agent    text
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_login_logs_logged_in_at ON login_logs(logged_in_at DESC);
  `);

  // Update users check constraint
  try {
    await pool.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    `);
    await pool.query(`
      ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'staff', 'student', 'user'));
    `);
  } catch (err) {
    console.warn("Could not update users check constraint:", err);
  }

  console.log("Database migration completed successfully!");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
