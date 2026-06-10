const interviewText = `สำนักทรัพยากรการเรียนรู้คุณหญิงหลง อรรถกระวีสุนทร มีการให้บริการสารสนเทศและบริการ
สนับสนุนการเรียนรู้ที่หลากหลายสำหรับนักศึกษา อาจารย์ บุคลากร และประชาชนทั่วไป โดยปัจจุบันบริการ
ต่าง ๆ ถูกพัฒนาและให้บริการผ่านหลายระบบ ทำให้ผู้ใช้ต้องเข้าถึงข้อมูลจาก หลากหลายช่องทาง เพื่อ
ยกระดับประสบการณ์ผู้ใช้ (User Experience) และเพิ่มประสิทธิภาพในการเข้าถึงบริการ สำนักฯ มีแนวคิด
ในการพัฒนาแพลตฟอร์มกลาง (Integrated Service Platform) ที่สามารถรวบรวมข้อมูลและบริการจาก
หลายระบบเข้าสู่จุดให้บริการเดียว (Single Service Platform)`;

export const InterviewPage = () => (
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
  </section>
);
