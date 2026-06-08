INSERT INTO service_requests
  (request_no, title, request_type, requester_name, requester_email, detail, created_at)
VALUES
  (
    'REQ-20260608-0001',
    'ขอเอกสารฉบับเต็มสำหรับบทความวิจัย',
    'บริการ Find Fulltext 4U',
    'กานต์ชนก แสงทอง',
    'kanchanok@example.com',
    'ต้องการบทความฉบับเต็มเพื่อใช้ประกอบการทำวิทยานิพนธ์',
    now() - interval '5 days'
  ),
  (
    'REQ-20260608-0002',
    'ตรวจสอบความซ้ำซ้อนของบทความก่อนส่งตีพิมพ์',
    'บริการตรวจการคัดลอกผลงาน (iThenticate)',
    'ธนพล ศรีสุข',
    'thanapon@example.com',
    'แนบไฟล์บทความฉบับร่างเพื่อตรวจสอบผ่าน iThenticate',
    now() - interval '4 days'
  ),
  (
    'REQ-20260608-0003',
    'จัดส่งหนังสือไปยังคณะวิทยาศาสตร์',
    'บริการนำส่งหนังสือ (Book Delivery)',
    'มณีรัตน์ ใจดี',
    'maneerat@example.com',
    'ต้องการให้นำส่งหนังสือที่จองไว้ไปยังสำนักงานคณะ',
    now() - interval '3 days'
  ),
  (
    'REQ-20260608-0004',
    'ค้นหาบทความที่อยู่นอกฐานข้อมูลบอกรับ',
    'บริการ Find Fulltext 4U',
    'ภาคิน วัฒนะ',
    'pakin@example.com',
    'มี DOI และรายละเอียดบรรณานุกรมครบถ้วน ต้องการไฟล์ PDF',
    now() - interval '2 days'
  ),
  (
    'REQ-20260608-0005',
    'ตรวจรายงานวิจัยฉบับสมบูรณ์',
    'บริการตรวจการคัดลอกผลงาน (iThenticate)',
    'อริสา พุ่มแก้ว',
    'arisa@example.com',
    'ขอตรวจรายงานวิจัยก่อนส่งให้แหล่งทุน',
    now() - interval '1 day'
  )
ON CONFLICT (request_no) DO NOTHING;

SELECT setval(
  'service_request_no_seq',
  GREATEST(
    5,
    COALESCE((SELECT MAX(split_part(request_no, '-', 3)::int) FROM service_requests), 0)
  ),
  true
);

