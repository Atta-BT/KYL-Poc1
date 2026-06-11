import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ExternalLink,
  FileCheck,
  FileText,
  Lock,
  Truck,
  X
} from "lucide-react";

const interviewText = `สำนักทรัพยากรการเรียนรู้คุณหญิงหลง อรรถกระวีสุนทร มีการให้บริการสารสนเทศและบริการ
สนับสนุนการเรียนรู้ที่หลากหลายสำหรับนักศึกษา อาจารย์ บุคลากร และประชาชนทั่วไป โดยปัจจุบันบริการ
ต่าง ๆ ถูกพัฒนาและให้บริการผ่านหลายระบบ ทำให้ผู้ใช้ต้องเข้าถึงข้อมูลจาก หลากหลายช่องทาง เพื่อ
ยกระดับประสบการณ์ผู้ใช้ (User Experience) และเพิ่มประสิทธิภาพในการเข้าถึงบริการ สำนักฯ มีแนวคิด
ในการพัฒนาแพลตฟอร์มกลาง (Integrated Service Platform) ที่สามารถรวบรวมข้อมูลและบริการจาก
หลายระบบเข้าสู่จุดให้บริการเดียว (Single Service Platform)`;

type ServiceDetail = {
  id: string;
  typeKey: "fulltext" | "ithenticate" | "bookdelivery";
  title: string;
  subtitle: string;
  descriptionTh: string;
  descriptionEn?: string;
  advantages?: string[];
  advantagesEn?: string[];
  note?: string;
  contact?: string;
  hasPdpa?: boolean;
};

const SERVICES_DATA: ServiceDetail[] = [
  {
    id: "fulltext-4u",
    typeKey: "fulltext",
    title: "บริการ Find Full-Text 4U",
    subtitle: "บริการบทความฉบับเต็มเพื่อคุณ",
    descriptionTh:
      "หอสมุดคุณหญิงหลงฯ ให้บริการ “Find Full-Text 4U” บริการบทความฉบับเต็มเพื่อคุณ แก่นักศึกษาอาจารย์ นักวิจัย มหาวิทยาลัยสงขลานครินทร์ โดยบริการสืบค้น จัดหาหรือจัดซื้อ บทความฉบับเต็มภาษาต่างประเทศ (Full-Text) จากฐานข้อมูลอิเล็กทรอนิกส์ หากบทความที่ต้องการไม่สามารถดาวน์โหลดฉบับเต็มได้",
    advantages: [
      "ฟรี ! ไม่มีค่าใช้จ่าย",
      "สะดวก รวดเร็ว",
      "ได้บทความตามที่ต้องการ",
      "เพื่อการวิจัยอย่างต่อเนื่อง"
    ],
    note: "หมายเหตุ : ให้บริการในวันเวลาราชการ และดำเนินการภายใน 3-5 วันทำการ",
    contact:
      "สอบถามข้อมูลเพิ่มเติม : คุณประไพ จันทร์อินทร์ โทรศัพท์ 0-7428-2394 หมายเลขภายใน 2394 หรืออีเมล : prapai.c@psu.ac.th"
  },
  {
    id: "ithenticate-checking",
    typeKey: "ithenticate",
    title: "iThenticate",
    subtitle: "บริการตรวจสอบผลงานด้วยโปรแกรม Ithenticate",
    descriptionTh:
      "บริการตรวจสอบผลงานด้วยโปรแกรม Ithenticate ให้บริการนักศึกษาปริญญาตรี อาจารย์ บุคลากร และนักศึกษาบัณฑิตศึกษามหาวิทยาลัยสงขลานครินทร์ เท่านั้น โดยเจ้าหน้าที่จะดำเนินการให้ ภายใน 1-2 วันทำการ",
    descriptionEn:
      "The iThenticate checking service is available exclusively for undergraduate students, faculty members, staff, and graduate students of Prince of Songkla University. The processing will be completed by the staff within 1–2 business days.",
    hasPdpa: true,
    contact:
      "หากท่านมีข้อสงสัยเพิ่มเติมเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ สามารถติดต่อเราได้ที่ : 0-7428-2358 (If you have any further questions regarding this Privacy Policy, you can contact us at: 0-7428-2358)"
  },
  {
    id: "book-delivery-service",
    typeKey: "bookdelivery",
    title: "Book Delivery",
    subtitle: "บริการนำส่งหนังสือสำหรับคณาจารย์และบุคลากร",
    descriptionTh:
      "บริการนำส่งหนังสือ (Book Delivery) สำหรับคณาจารย์ นักวิจัย และบุคลากร มหาวิทยาลัยสงขลานครินทร์ เพื่อความสะดวกรวดเร็วในการยืมคืนทรัพยากรสารสนเทศ โดยหอสมุดจะดำเนินการจัดส่งหนังสือที่ผู้ใช้บริการต้องการจากทรัพยากรของหอสมุดต่างๆ ภายในมหาวิทยาลัย ส่งตรงถึงหน่วยงานหรือคณะของท่าน",
    descriptionEn:
      "The Book Delivery service is available for faculty members, researchers, and staff of Prince of Songkla University, providing a convenient way to borrow library resources. The library will deliver books requested from various campuses directly to your department or office.",
    advantages: [
      "ยืม-คืนทรัพยากรได้สะดวก รวดเร็ว",
      "จัดส่งตรงถึงหน่วยงาน/คณะ",
      "ติดตามสถานะการจัดส่งได้ตลอดเวลา"
    ],
    advantagesEn: [
      "Fast and convenient borrowing/returning",
      "Delivered directly to your department/faculty",
      "Track delivery status online anytime"
    ],
    note: "หมายเหตุ : ให้บริการในวันเวลาราชารการ และดำเนินการภายใน 1-2 วันทำการ",
    contact:
      "สอบถามข้อมูลเพิ่มเติม : เคาน์เตอร์บริการยืม-คืน โทรศัพท์ 0-7428-2352"
  }
];

export const InterviewPage = () => {
  const navigate = useNavigate();
  const [activeService, setActiveService] = useState<ServiceDetail | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  const isAuthenticated = sessionStorage.getItem("kyl-authenticated") === "true";
  const userJson = sessionStorage.getItem("kyl-user");
  const user = userJson
    ? (JSON.parse(userJson) as { fullName: string; email: string; role?: string })
    : null;

  const handleCardClick = (service: ServiceDetail) => {
    setActiveService(service);
    setConsentChecked(false);
  };

  const handleCloseModal = () => {
    setActiveService(null);
    setConsentChecked(false);
  };

  const handleRequestService = (typeKey: string) => {
    handleCloseModal();
    navigate(`/requests/new?type=${typeKey}`);
  };

  return (
    <section className="page-stack">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">KYL Learning Resources Center</p>
          <h2>Interview</h2>
        </div>
      </div>

      <section className="panel interview-panel">
        <p className="interview-copy">{interviewText}</p>
      </section>

      <h3 className="services-section-title">บริการแนะนำ / Recommended Services</h3>
      
      <div className="services-grid">
        {SERVICES_DATA.map((service) => {
          let IconComponent = FileText;
          if (service.typeKey === "ithenticate") IconComponent = FileCheck;
          else if (service.typeKey === "bookdelivery") IconComponent = Truck;

          return (
            <div
              key={service.id}
              className="service-card"
              onClick={() => handleCardClick(service)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleCardClick(service);
                }
              }}
            >
              <div className="service-card__top">
                <div className="service-card__title">{service.title}</div>
                <div className="service-card__desc">
                  {service.subtitle}
                  <br />
                  {service.descriptionTh}
                </div>
              </div>
              <div className="service-card__footer">
                <span>รายละเอียดบริการ</span>
                <ArrowRight size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {activeService && (
        <div
          className="modal-overlay"
          onClick={handleCloseModal}
          role="presentation"
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-header">
              <h3 id="modal-title">{activeService.title}</h3>
              <button
                className="modal-close-btn"
                onClick={handleCloseModal}
                aria-label="ปิดหน้าต่าง"
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="service-detail-section">
                <div className="service-detail-desc">
                  {activeService.descriptionTh}
                  {activeService.descriptionEn && (
                    <>
                      <div className="divider-line" />
                      {activeService.descriptionEn}
                    </>
                  )}
                </div>

                {activeService.advantages && activeService.advantages.length > 0 && (
                  <div>
                    <strong>ข้อดีของการใช้บริการ :</strong>
                    <ul className="service-advantages">
                      {activeService.advantages.map((adv, idx) => (
                        <li key={idx}>{adv}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeService.advantagesEn && activeService.advantagesEn.length > 0 && (
                  <div>
                    <strong>Advantages :</strong>
                    <ul className="service-advantages">
                      {activeService.advantagesEn.map((adv, idx) => (
                        <li key={idx}>{adv}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeService.typeKey === "ithenticate" && (
                  <div className="consent-box">
                    <p style={{ marginTop: 0, fontWeight: 600, color: "var(--primary-light)" }}>
                      {user ? (
                        `Hi, ${user.fullName}. When you submit this form, the owner will see your name and email address.`
                      ) : (
                        "เมื่อส่งแบบฟอร์มนี้ ผู้รับข้อมูลจะเห็นชื่อและอีเมลของคุณ (When you submit this form, the owner will see your name and email address.)"
                      )}
                    </p>
                    
                    <div className="divider-line" />
                    
                    <div className="consent-title">นโยบายการคุ้มครองข้อมูลส่วนบุคคล (Privacy Policy)</div>
                    <div style={{ fontSize: "0.9rem", margin: "4px 0 12px", color: "var(--text)" }}>
                      เรียนผู้ใช้บริการ
                      <br />
                      แบบฟอร์มบริการตรวจสอบผลงานด้วยโปรแกรม Ithenticate จัดทำขึ้นเพื่อบริการตรวจสอบผลงาน ด้วยโปรแกรม Ithenticate ให้แก่คณาจารย์ บุคลากร นักศึกษา มหาวิทยาลัยสงขลานครินทร์ โดยห้องสมุดให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของท่าน ตามประกาศมหาวิทยาลัยสงขลานครินทร์ เรื่อง นโยบายคุ้มครองข้อมูลส่วนบุคคล พ.ศ. ๒๕๖๖
                      <br />
                      อ่านเพิ่มเติม :{" "}
                      <a
                        href="https://link.psu.th/AFQv9W"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--accent)", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "2px" }}
                      >
                        https://link.psu.th/AFQv9W <ExternalLink size={12} />
                      </a>
                    </div>
                    <div style={{ fontSize: "0.9rem", margin: "12px 0 16px", color: "var(--text)" }}>
                      Dear Users,
                      <br />
                      The iThenticate Service Request Form has been created to provide plagiarism checking services using the iThenticate program for faculty members, staff, and students of Prince of Songkla University. The library places great importance on protecting your personal data in accordance with the Prince of Songkla University Personal Data Protection Policy B.E. 2566 (2023).
                      <br />
                      Read more :{" "}
                      <a
                        href="https://link.psu.th/AFQv9W"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--accent)", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "2px" }}
                      >
                        https://link.psu.th/AFQv9W <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="divider-line" />

                    <div className="consent-title">1. การให้ความยินยอม / Consent</div>
                    <p style={{ fontSize: "0.88rem", margin: "4px 0 12px", color: "var(--muted)" }}>
                      หากท่านมีข้อสงสัยเพิ่มเติมเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ สามารถติดต่อเราได้ที่ : 0-7428-2358
                      <br />
                      If you have any further questions regarding this Privacy Policy, you can contact us at: 0-7428-2358
                    </p>

                    <label className="consent-label">
                      <input
                        type="checkbox"
                        checked={consentChecked}
                        onChange={(e) => setConsentChecked(e.target.checked)}
                      />
                      <span>
                        ข้าพเจ้าได้อ่านและเข้าใจนโยบายการคุ้มครองข้อมูลส่วนบุคคลนี้แล้ว และยินยอมให้เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้าตามวัตถุประสงค์ที่ระบุไว้ข้างต้น (I have read and understood this Personal Data Protection Policy and hereby consent to the collection, use, and disclosure of my personal data for the purposes stated above.)
                      </span>
                    </label>
                  </div>
                )}

                {activeService.note && (
                  <p style={{ margin: 0, fontWeight: 600, color: "var(--warning)" }}>
                    {activeService.note}
                  </p>
                )}

                {activeService.contact && (
                  <div className="service-contact-info">
                    {activeService.contact}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="button button--ghost"
                onClick={handleCloseModal}
                type="button"
              >
                ปิด
              </button>

              {isAuthenticated ? (
                user?.role === "user" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                    <div className="divider-line" style={{ margin: "4px 0" }} />
                    <div className="login-options-hint" style={{ color: "var(--brand-accent)", fontWeight: "600", textAlign: "center", justifyContent: "center" }}>
                      <Lock size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                      เฉพาะนักศึกษาและบุคลากรเท่านั้นที่สามารถใช้บริการนี้ได้ (Only students and staff can request this service)
                    </div>
                  </div>
                ) : (
                  <button
                    className="button button--primary"
                    onClick={() => handleRequestService(activeService.typeKey)}
                    disabled={activeService.hasPdpa && !consentChecked}
                    type="button"
                  >
                    ใช้บริการ
                  </button>
                )
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                  <div className="divider-line" style={{ margin: "4px 0" }} />
                  <div className="login-options-hint">
                    <Lock size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                    กรุณาเข้าสู่ระบบก่อนใช้บริการ (Please log in to request this service)
                  </div>
                  <div className="modal-login-buttons">
                    <Link
                      className="button button--primary"
                      to={`/login?center=learning-request-center&returnTo=/requests/new?type=${activeService.typeKey}`}
                    >
                      เข้าสู่ระบบสำหรับ นักศึกษา/บุคลากร
                    </Link>
                    <Link
                      className="button button--secondary"
                      to={`/login?center=public-service&returnTo=/requests/new?type=${activeService.typeKey}`}
                    >
                      เข้าสู่ระบบสำหรับ บุคคลทั่วไป
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
