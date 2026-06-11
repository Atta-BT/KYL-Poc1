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
  console.log("Database migration completed successfully!");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
