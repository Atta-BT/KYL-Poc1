# KYL Request Platform POC

Web-based Application สำหรับจัดการรายการ Request ตามโจทย์ POC ชุดที่ 1 โดยใช้ React, TypeScript, Node.js, C# และ PostgreSQL

## ฟังก์ชั่นที่รองรับ

- แสดงรายการ Request แบบตาราง ครั้งละ 10 รายการ พร้อม pagination
- ค้นหาและกรองรายการตามประเภท Request
- เพิ่ม Request พร้อม validation
- แก้ไข Request พร้อมแสดงค่าปัจจุบัน
- ลบ Request แบบ Soft Delete โดยบันทึก `deleted_at`
- เชื่อมต่อ PostgreSQL ผ่าน RESTful APIs
- มี Node.js API เป็น backend หลัก และ C# ASP.NET Core API เป็น backend ทางเลือก

## โครงสร้างโปรเจกต์

```text
apps/
  web/                  React + TypeScript + Vite UI
services/
  api-node/             Node.js + Express + TypeScript REST API
  api-csharp/           C# ASP.NET Core REST API
database/
  schema.sql            PostgreSQL schema, indexes, trigger
  seed.sql              ข้อมูลตัวอย่าง
docker-compose.yml      PostgreSQL สำหรับ local development
```

## วิธีรันแบบ Local

1. ติดตั้ง dependencies

```powershell
npm install
```

2. สร้างไฟล์ environment

```powershell
Copy-Item services/api-node/.env.example services/api-node/.env
Copy-Item apps/web/.env.example apps/web/.env
```

3. เปิด PostgreSQL

```powershell
docker compose up -d postgres
```

4. รัน Node.js API

```powershell
npm run dev:api
```

API จะอยู่ที่ `http://localhost:4000/api`

5. รัน React UI

```powershell
npm run dev:web
```

Web app จะอยู่ที่ `http://localhost:5173`

## รัน C# API

ต้องมี .NET 8 SDK ก่อนใช้งาน

```powershell
dotnet restore services/api-csharp/Kyl.Poc.Api.csproj
dotnet run --project services/api-csharp/Kyl.Poc.Api.csproj
```

C# API จะอยู่ที่ `http://localhost:5000/api`

หากต้องการให้ React เรียก C# API ให้แก้ `apps/web/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## REST Endpoints

```text
GET    /api/health
GET    /api/request-types
GET    /api/requests?page=1&pageSize=10&search=&type=
GET    /api/requests/:id
POST   /api/requests
PUT    /api/requests/:id
DELETE /api/requests/:id
```

Payload สำหรับเพิ่ม/แก้ไข

```json
{
  "title": "ขอเอกสารฉบับเต็มสำหรับบทความวิจัย",
  "requestType": "บริการ Find Fulltext 4U",
  "requesterName": "กานต์ชนก แสงทอง",
  "requesterEmail": "kanchanok@example.com",
  "detail": "ต้องการบทความฉบับเต็มเพื่อใช้ประกอบการทำวิทยานิพนธ์"
}
```

## Database

ตารางหลักคือ `service_requests`

- `request_no` สร้างอัตโนมัติในรูปแบบ `REQ-YYYYMMDD-0001`
- `request_type` จำกัดค่าไว้ตามโจทย์
- `deleted_at` ใช้สำหรับ Soft Delete
- มี index สำหรับรายการล่าสุด, ประเภท และการค้นหา

