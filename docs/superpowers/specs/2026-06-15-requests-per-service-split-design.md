# Requests Module — Per-Service Split (Registry/Plugin Pattern)

วันที่: 2026-06-15

## ปัญหา
โมดูล requests ทั้ง backend และ frontend รวมการทำงานของ 3 บริการ
(iThenticate, Find Fulltext 4U, Book Delivery) ไว้ในไฟล์เดียว ด้วย `if/else`
ตาม `requestType`:

- Backend `request.repository.ts` — `if/else` ก้อนใหญ่ใน `create`/`update`,
  `request.types.ts`/`request.validation.ts` แบนรวมทุก field ของทุกบริการ
- Frontend `RequestFormPage.tsx` — ~1076 บรรทัด, `useState` 20+ ตัว,
  `if/else` render ฟอร์มของแต่ละบริการ

ผลคือ เพิ่ม/แก้บริการ 1 ตัว ต้องไปแก้หลายจุดในไฟล์ยักษ์ เสี่ยงพังของเดิม
และดูแลยาก

## เป้าหมาย
แยกการทำงานของแต่ละบริการออกจากกัน เพื่อให้แก้ไขง่ายและ scalable
เพิ่มบริการใหม่ = เพิ่ม 1 ไฟล์ backend + 1 ไฟล์ frontend + ลงทะเบียน 1 บรรทัด
โดยไม่ต้องแตะโค้ดของบริการเดิม

## แนวทาง: Registry / Plugin pattern
แต่ละบริการเป็น "plugin module" ที่เป็นเจ้าของ logic ของตัวเองทั้งหมด
โค้ด generic (list, pagination, CRUD orchestration, routing, ตารางหลัก
`service_requests`) อยู่ส่วนกลางและเรียกใช้ plugin ผ่าน registry

## Backend — `services/api-node/src/modules/requests/`
```
request.routes.ts          (ไม่เปลี่ยน)
request.service.ts         (ไม่เปลี่ยน)
request.repository.ts      (generic: ไม่มี SQL เฉพาะบริการ)
request.types.ts           (base + ประกอบ type จาก field group ของแต่ละ plugin)
request.validation.ts      (base schema + รวม schema ของแต่ละ plugin)
services/
  plugin.ts                (interface RequestTypePlugin + helper)
  ithenticate.ts
  fulltext.ts
  book-delivery.ts
  registry.ts              (Map<RequestType, plugin> + array)
```

### interface `RequestTypePlugin`
- `type: RequestType`
- `selectColumns: string` — SQL fragment (aliased) สำหรับ SELECT
- `joinClause: string` — `LEFT JOIN ...`
- `mapRow(row): Partial<ServiceRequest>` — field เฉพาะบริการเป็น camelCase
- `upsert(client, requestId, payload): Promise<void>` — ใช้ทั้ง create/update (ON CONFLICT)
- `deleteFor(client, requestId): Promise<void>`
- `schema: ZodRawShape` — zod ของ field เฉพาะบริการ
- field TS interface เฉพาะบริการ (export แยก)

### repository (generic)
- `list`/`findById`: ประกอบ SELECT จาก `plugins.map(selectColumns/joinClause)`
  และ map row โดย merge base mapping กับ `p.mapRow(row)` ของทุก plugin
- `create`: insert ตารางหลัก → `registry.get(type).upsert(...)`
- `update`: update ตารางหลัก → `upsert` ของ type ที่ตรง, loop `deleteFor`
  ของ plugin อื่นทั้งหมด

## Frontend — `apps/web/src/`
```
features/requests/serviceForms/
  types.ts                 (interface ServiceFormModule)
  ithenticate.tsx
  fulltext.tsx
  bookDelivery.tsx
  registry.ts
  facultyOptions.ts        (รวมรายชื่อคณะที่ตอนนี้ซ้ำ 3 ที่)
pages/RequestFormPage.tsx  (shell: field กลาง + เรียก <Form> ของบริการที่เลือก)
```

### interface `ServiceFormModule<TValue>`
- `type: RequestType`
- `emptyValue: TValue`
- `fromRequest(req: ServiceRequest): TValue`
- `validate(value: TValue): Record<string, string>`
- `buildPayload(value: TValue): { detail: string; extra: Partial<RequestPayload> }`
- `Form: FC<{ value; onChange; errors }>`

`RequestFormPage` เหลือ field กลาง + `serviceValue` ของบริการที่เลือก,
dispatch ผ่าน registry — ตัด useState 20+ และ if/else ~700 บรรทัด

## ไม่เปลี่ยน (กันของเดิมพัง)
- API contract / response shape เดิม
- DB schema เดิม
- พฤติกรรม UI / validation / ข้อความ error เดิมทุกอย่าง

## การตรวจสอบ
ไม่มี automated test ในโปรเจกต์ → refactor แบบ behavior-preserving
และยืนยันด้วย `tsc`/build ของทั้ง backend และ frontend
