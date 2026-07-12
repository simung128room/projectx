import React from "react";
import { Shield, ListChecks, Phone, X, Mail } from "lucide-react";
import { motion } from "motion/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── PRIVACY POLICY MODAL ──────────────────────────────────────────────────
export const PrivacyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#000000]/60 backdrop-blur-3xl saturate-150 flex items-center justify-center p-4 z-[100] font-sans" role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} tabIndex={-1} autoFocus
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-card border border-[#374151] p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] flex flex-col relative"
      >
        <h2 className="text-xl sm:text-2xl font-medium mb-6 text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 shrink-0 text-[#364153]" />{" "}
          นโยบายความเป็นส่วนตัว (Privacy Policy)
        </h2>
        <div className="overflow-y-auto pr-2 sm:pr-4 space-y-6 text-sm leading-relaxed text-muted-foreground scrollbar-thin scrollbar-thumb-zinc-700 flex-1">
          <p>
            <strong>อัปเดตล่าสุด:</strong>{" "}
            {new Date().toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <div>
            <h3 className="font-medium text-foreground text-base mb-2">
              1. ข้อมูลที่เราเก็บรวบรวม
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>ข้อมูลระบุตัวตนและบัญชี:</strong>{" "}
                เมื่อคุณสมัครสมาชิก เราอาจจัดเก็บข้อมูลเช่น อีเมล
                ชื่อผู้ใช้ รหัสผ่าน (ที่ถูกเข้ารหัสและทำแฮชอย่างแน่นหนา)
                ข้อมูลสิทธิ์การใช้งาน (Role/VIP) และเครดิตคงเหลือของคุณ
              </li>
              <li>
                <strong>ข้อมูลการทำธุรกรรม (Transaction Data):</strong>{" "}
                หากมีการทำธุรกรรมเติมเงินซื้อสินค้า
                เราจะเก็บข้อมูลบันทึกการทำธุรกรรม เช่น เวลา จำนวนเงิน
                หมายเลขอ้างอิง เพื่อประเมิน วิเคราะห์
                และป้องกันการหลอกลวง
              </li>
              <li>
                <strong>ข้อมูล IP Address และ Log Files:</strong>{" "}
                ตามข้อบังคับและเพื่อความปลอดภัย เรามีการเก็บบันทึก IP
                Address, Browser Agent, เวลาเข้าระบบ
                และพฤติกรรมการใช้งาน
                เพื่อใช้เป็นหลักฐานและป้องกันเหตุโจมตีระบบ
              </li>
              <li>
                <strong>
                  ข้อมูลการเชื่อมต่อคู่ค้า (External API):
                </strong>{" "}
                หากคุณผูกบัญชีบริการภายนอก เช่น Discord หรือ Telegram
                เรามีความจำเป็นต้องดึงข้อมูลสาธารณะหรือ Token
                ที่คุณอนุญาตเพื่อใช้ทำงานบนแพลตฟอร์มของเรา
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-base mb-2">
              2. การปกป้องข้อมูล Combo และสินทรัพย์ของท่าน
            </h3>
            <p className="mb-2">
              ทางแพลตฟอร์มขอยืนยันว่า{" "}
              <strong>
                จะไม่มีการบันทึกหรือโจรกรรมข้อมูลบัญชี/รหัสผ่านหน้าเว็บแบบเต็มจำนวนเพื่อผลประโยชน์อื่นใด
              </strong>
            </p>
            <p>
              คีย์และข้อมูลที่คุณกรอกจะถูกใช้ประมวลผลเซสชั่นชั่วคราว
              (Volatile) ระหว่างเว็บและเซิร์ฟเวอร์
              และข้อมูลดิบจะถูกพิจารณาล้างออกทันทีเมื่อเสร็จสิ้นรอบ
              เพื่อสร้างความเชื่อมั่นสูงสุด 100% ให้แก่ผู้ใช้งาน
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-base mb-2">
              3. การเปิดเผยข้อมูลแก่บุคคลที่สาม
            </h3>
            <p>
              เอเพ็กซ์สโตร์จะไม่นำข้อมูลส่วนตัว อีเมล
              หรือเงินคงเหลือของคุณไปเปิดเผย จำหน่าย
              หรือแลกเปลี่ยนกับบุคคลที่สามโดยเด็ดขาด <em>เว้นแต่:</em>
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>
                ผู้ให้บริการประมวลผลที่จำเป็น (Cloud Hosting, Payment
                Gateway) เฉพาะส่วนที่ต้องให้บริการ
              </li>
              <li>
                เป็นไปเพื่อปฏิบัติตามกฎหมาย มีคำสั่งศาล
                หรือคำสั่งของหน่วยงานที่มีอำนาจบังคับตามกฎหมาย
              </li>
              <li>
                เพื่อใช้ป้องกันและรักษาความปลอดภัยต่อชีวิต
                หรือปกป้องทรัพย์สินของ APEXSTORE{" "}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-base mb-2">
              4. คุกกี้ (Cookies) และการจัดเก็บ Cache
            </h3>
            <p>
              เราใช้คุกกี้ Session และ Local Storage
              เพื่อช่วยจดจำการเข้าสู่ระบบ สถานะการทำงาน หรือตั้งค่าธีม
              ลดภาระที่คุณต้องล็อกอินซ้ำ ไม่มีโฆษณาแทรกแซง ไม่มีการใช้
              Tracking Pixels นำมาวิเคราะห์ขายต่อ หากคุณลบแคช
              การเชื่อมต่อและการจดจำทั้งหมดที่คุณบันทึกไว้ในเบราว์เซอร์จะถูกล้างใหม่ทันที
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-base mb-2">
              5. สิทธิของเจ้าของข้อมูล (Data Subject Rights)
            </h3>
            <p>
              ภายใต้กฎหมายที่มีผลบังคับ คุณมีสิทธิขอเข้าถึง แก้ไข
              แจ้งขอสำเนา หรือลบข้อมูลบัญชีของตนเองได้บางส่วน ทั้งนี้
              อาจมีข้อยกเว้นสำหรับประวัติการทำรายได้ ธุรกรรม
              ข้อมูลล็อกที่ขัดกฎหมายการลบข้อมูล (Data Retention)
              หากประสงค์ติดต่อเพื่อลบข้อมูล
              สามารถขอความช่วยเหลือแอดมินได้ผ่านหน้าติดต่อ
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-base mb-2">
              6. การแก้ไขเปลี่ยนแปลงนโยบาย
            </h3>
            <p>
              ระบบขอสงวนสิทธิ์ในการแก้ไขปรับปรุง
              เปลี่ยนแปลงข้อความในนโยบายฉบับนี้โดยไม่ต้องแจ้งให้ผู้ใช้ทราบล่วงหน้า
              โดยสามารถตรวจสอบวันได้ที่หน้าหัวข้อ “อัปเดตล่าสุด”
              การเข้าถึงแพลตฟอร์มอย่างต่อเนื่องถือเป็นการยืนยันและการยอมรับข้อตกลงฉบับปรับปรุงแล้ว
            </p>
          </div>
        </div>
        <div className="pt-6 mt-6 border-t border-[#374151] flex gap-3 flex-col sm:flex-row justify-end">
          <button
            onClick={onClose}
            className="bg-primary text-primary-foreground hover:bg-zinc-600/25 text-[#364153] font-medium py-3 px-8 transition-colors w-full sm:w-auto cursor-pointer"
          >
            ทำความเข้าใจและปิดหน้าต่าง
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── TERMS OF SERVICE MODAL ───────────────────────────────────────────────
export const TermsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#000000]/60 backdrop-blur-3xl saturate-150 flex items-center justify-center p-4 z-[100] font-sans" role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} tabIndex={-1} autoFocus
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-card border border-[#374151] p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] flex flex-col relative"
      >
        <h2 className="text-xl sm:text-2xl font-medium mb-6 flex items-center gap-2 text-foreground">
          <ListChecks className="w-6 h-6 shrink-0 text-[#364153]" />{" "}
          ข้อกำหนดการใช้งาน (Terms of Use)
        </h2>
        <div className="overflow-y-auto pr-2 sm:pr-4 space-y-6 text-sm leading-relaxed text-muted-foreground scrollbar-thin scrollbar-thumb-zinc-700 flex-1">
          <div>
            <h3 className="font-medium text-foreground text-base mb-2">
              1. การรับรองความยินยอมและผูกพัน
            </h3>
            <p>
              การเข้าถึงและใช้งานบริการ เครื่องมือตรวจสอบ บอท
              และผลิตภัณฑ์ของเรา
              ถือเป็นการรับรองว่าท่านได้ทำความเข้าใจและตกลงยอมรับเงื่อนไขการใช้บริการของ{" "}
              <strong>APEXSTORE</strong> อย่างครบถ้วนทุกประการ
              หากคุณไม่เห็นด้วยกับกฎหมายและข้อบังคับเหล่านี้กรุณายุติการเข้าถึงและการใช้งานโดยทันที
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-base mb-2">
              2. ขอบเขตสิทธิ์ หน้าที่ และการใช้งานที่ยอมรับได้ (AUP)
            </h3>
            <p className="mb-2">
              คุณตกลงที่จะใช้สิทธิ์ในการเข้าถึงที่เรารับรอง
              เพื่อจุดประสงค์ส่วนตัวที่ถูกต้องตามกฎหมาย และยินยอมที่จะ{" "}
              <strong>ไม่กระทำ</strong> สิ่งเหล่านี้ไม่ว่ากรณีใดๆ :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>
                  ห้ามวิศวกรรมย้อนกลับ (No Reverse Engineering):
                </strong>{" "}
                ห้ามดัดแปลง ชำแหละเจาะระบบ สแกนพอร์ต จำลอง API เถื่อน นำ
                API ผิดกฎหมายหรือ Bypass
                เข้าใช้บริการของเราโดยไม่ได้รับอนุญาต
              </li>
              <li>
                <strong>
                  ห้ามกระทำละเมิดแพลตฟอร์มรุนแรง (Anti-DDoS, Spamming):
                </strong>{" "}
                ห้ามทดสอบความปลอดภัย ก่อความล่าช้า หรือกระหน่ำยิงแพ็กเกจ
                (Flood Requests) เพื่อทำลายความเสถียรของเซิร์ฟเวอร์
              </li>
              <li>
                <strong>ข้อพิพาทความเป็นเจ้าของข้อมูลส่วนบุคคล:</strong>{" "}
                ผู้ใช้งานจะต้องเป็นเจ้าของข้อมูล พาสเวิร์ด คีย์ บัญชี
                หรือมีสิทธิ์อนุญาตโดยชอบธรรมเท่านั้น
                หากท่านนำไปใช้งานในทางละเมิดผู้อื่น สิทธิ
                ความรับผิดชอบทางกฎหมายใดๆ
                ถือเป็นความรับผิดชอบของตัวลูกค้า/ผู้ใช้งานโดยเพียงผู้เดียวเท่านั้น
                ทางทีมงานจะไม่มีส่วนรู้เห็นในทุกกรณี
              </li>
              <li>
                <strong>การบ่อนทำลาย/แอบอ้าง:</strong> ห้ามคัดลอก
                ทำสำเนาเนื้อหา และผลิตภัณฑ์เพื่อไปชุบมือเปิบ แอบอ้าง
                หรือขายนอกแพลตฟอร์มโดยไม่ได้รับอนุญาต
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-base mb-2">
              3. การชำระเงิน การเติมเงิน และนโยบายล้างบางเครดิต (No
              Refund Policy)
            </h3>
            <p className="mb-2">
              เมื่อคุณยืนยันเติมเครดิต ชำระคีย์ โอนเงินซื้อบัญชี
              หรือสินค้าดิจิทัลใน APEXSTORE คำสั่งซื้อดังกล่าว{" "}
              <strong>
                ไม่สามารถคืนเป็นเงินสด (Non-Refundable) ในทุกกรณี
              </strong>{" "}
              เครดิตในรหัสไม่สามารถโยกย้ายข้ามผู้ใช้ได้
              หากพบความผิดปกติของการเติมเงิน บัตรปลอม หรือการโกง
              แอดมินมีสิทธิเต็มที่ในการเพิกถอนยอด ล็อคแบน
              และยึดสินค้าทั้งหมดทันที
            </p>
            <p>
              สินค้ารับประกันการใช้งาน
              จะถูกอ้างอิงตามระยะเวลาประกันของสินค้าชิ้นนั้นๆ
              หากเลยเงื่อนไขที่กำหนดไว้จะไม่รับผิดชอบทุกกรณี
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-base mb-2">
              4. ข้อยกเว้นและข้อจำกัดความรับผิดชอบ (Disclaimer)
            </h3>
            <p className="mb-2">
              การทำธุรกรรมและเครื่องมือนี้ ทำงานในรูปแบบ "ตามสภาพ (As
              is)" เราไม่รับประกัน 100% ว่าไม่มีข้อบกพร่อง การขัดข้อง
              ล่าช้า หรือผลเช็คต่างๆ จะแม่นยำเสมอไป
              ทั้งนี้เครื่องมือเราไร้สถานะ (No-Affiliation)
              ต่อนายจ้างหรือบริษัทแม่ของช่องโซเชียลนั้นๆ
            </p>
            <p>
              เราจะไม่รับผิดชอบจากความสูญเสีย โดนแบน ยอดวิวตก
              หรือความเสียหายในทางอ้อม ทางการค้า
              หรือทางปกครองที่เกิดจากการเข้าใช้บริการ ข้อมูลต่างๆ
              สามารถเข้าถึงได้ขึ้นอยู่กับความเสี่ยงของตนเอง
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-base mb-2">
              5. สิทธิของการยุติการให้บริการ และ IP Ban
            </h3>
            <p>
              ทีมงาน APEXSTORE ถือสิทธิเด็ดขาดสูงสุดในการเตะ
              หรือถอดถอนผู้ใช้ ระงับบัญชี (Ban)
              เปลี่ยนแปลงแก้ไขการใช้งาน และระงับช่องทางการเข้าถึง (IP
              Blocking) โดยไม่ต้องแจ้งตักเตือนรวมถึงชดใช้ค่าเสียหายใดๆ
              ให้แก่ผู้ใช้งาน หากพบการทุจริต หรือคุกคามเจ้าหน้าที่
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-base mb-2">
              6. การจัดการและระบบต่างๆ
            </h3>
          </div>
          <div>
            <h3 className="font-medium text-foreground text-base mb-2">
              ระบบและบริการของเรา
            </h3>
            <ul className="list-disc pl-5">
              <li>
                <strong>ระบบตรวจสอบไอดี (ตัวเช็ค):</strong>{" "}
                ทรงพลังที่รองรับบัญชีจำนวนมากพร้อมกัน
                โดยไม่สูญเสียความแม่นยำ ที่ทันสมัย
              </li>
              <li>
                <strong>Discord & Telegram Connect API:</strong>{" "}
                ให้บริการระบบดึงข้อมูล ยืนยันสลิป การรับยศบอท (Auto
                Role) และสิทธิพิเศษการจำลองเซิร์ฟเวอร์แบบเบ็ดเสร็จ
              </li>
              <li>
                <strong>Digital Marketplace & VIP Tiers:</strong>{" "}
                ร้านค้าจำหน่ายผลิตภัณฑ์ซอฟต์แวร์ คีย์โปรแกรม
                และคลังบัญชีพรีเมียม สำหรับลูกค้าสายโซเชียล
                รวมถึงลูกค้าองค์กร ด้วยระบบจัดการคลัง Stock ที่รวดเร็ว
                ตัดยอดและส่งสินค้าผ่านระบบอัตโนมัติตลอด 24 ชั่วโมง
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-base mb-2">
              ความมุ่งมั่นด้านความปลอดภัย (Security Commitment)
            </h3>
            <p>
              รากฐานของโปรเจ็กต์คือการเก็บรักษาข้อมูลให้เป็นความลับ
              (Confidentiality)
              สถาปัตยกรรมเซิร์ฟเวอร์ของเรามีระบบการแฮชคีย์รหัสผ่าน
              การลดพึ่งพิงฐานข้อมูลที่เก็บรอยนิ้วมือของผู้ใช้ (Zero
              Logging Policy สำหรับเครดิตการเช็ค)
              ทำให้ข้อมูลการทำธุรกรรมของคุณได้รับการการันตี 100%
              ภายใต้ความน่าเชื่อถือของแพลตฟอร์ม
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground text-base mb-2">
              ช่องทางติดต่อคอมมูนิตี้ (Contact & Community)
            </h3>
            <p className="mb-2">
              เราไม่ได้มีแต่เว็บขายของ
              แต่เราเติบโตด้วยแรงสุนทรีย์ของคอมมูนิตี้
              หากคุณประสบปัญหาในการใช้งาน พบช่องโหว่
              หรืออยากพูดคุยเสนอแนวทางใหม่ๆ:
            </p>
            <ul className="list-disc pl-5">
              <li>
                <strong>Discord Server:</strong> สถานที่เชื่อมสัมพันธ์
                ร้องขอเครดิต หรือสอบถามการเซ็ตอัปบอท
              </li>
              <li>
                <strong>Line Official:</strong> ทีม Support
                โดยผู้ดูแลมืออาชีพ (ตอบกลับรวดเร็วที่สุด)
              </li>
            </ul>
            <p className="mt-2 text-muted-foreground italic">
              "ขอบคุณผู้ใช้งานและพันธมิตรทุกคน
              ที่เล็งเห็นคุณค่าและก้าวเดินไปพร้อมกับ APEXSTORE
              ขวากหนามทางดิจิทัลไหนที่ยาก... เราพร้อมเบิกทางให้คุณ"
            </p>
          </div>
        </div>
        <div className="pt-6 mt-6 border-t border-[#374151] flex justify-end w-full">
          <button
            onClick={onClose}
            className="bg-primary text-primary-foreground hover:bg-zinc-600/25 text-[#364153] font-medium py-3 px-8 transition-all w-full sm:w-auto cursor-pointer"
          >
            ปิดหน้าต่างนี้
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── CONTACT US MODAL ──────────────────────────────────────────────────────
interface ContactModalProps extends ModalProps {
  siteSettings?: any;
}

export const ContactUsModal: React.FC<ContactModalProps> = ({ isOpen, onClose, siteSettings }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#000000]/60 backdrop-blur-3xl saturate-150 flex items-center justify-center p-4 z-[100] font-sans" role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} tabIndex={-1} autoFocus
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-card border border-[#374151] p-6 sm:p-8 max-w-md w-full flex flex-col relative"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-medium flex items-center gap-2 text-foreground">
            <Phone className="w-6 h-6 shrink-0 text-[#364153]" />{" "}
            ติดต่อเรา
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-foreground/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <a
            href="https://discord.gg/EvFjgkSB4W"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 p-4 bg-card hover:bg-[#5865F2]/20 border border-[#5865F2]/20 text-foreground transition-all group"
          >
            <div className="w-12 h-12 bg-card flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <span className="font-semibold text-xl block">D</span>
            </div>
            <div>
              <h3 className="font-medium text-lg">Discord</h3>
              <p className="text-muted-foreground text-sm">
                เข้าร่วมเซิร์ฟเวอร์ของเรา
              </p>
            </div>
          </a>

          {siteSettings?.contact_email && (
            <a
              href={`mailto:${siteSettings.contact_email}`}
              className="flex items-center gap-4 p-4 bg-card hover:bg-[#1e1e1e] border border-[#374151] text-foreground transition-all group"
            >
              <div className="w-12 h-12 bg-card flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-lg">Email</h3>
                <p className="text-muted-foreground text-sm">
                  {siteSettings.contact_email}
                </p>
              </div>
            </a>
          )}
        </div>

        <div className="pt-6 mt-6 border-t border-[#374151] flex justify-end w-full">
          <button
            onClick={onClose}
            className="bg-primary text-primary-foreground hover:bg-zinc-600/25 text-[#364153] font-medium py-3 px-8 transition-all w-full sm:w-auto cursor-pointer"
          >
            ปิดหน้าต่างนี้
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
