import React from "react";
import { Shield, ListChecks, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface PolicyViewProps {
  onBack: () => void;
}

export const PrivacyView: React.FC<PolicyViewProps> = ({ onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto w-full font-sans text-zinc-850 pb-32"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 text-sm font-medium transition-colors mb-8 cursor-pointer bg-white border border-zinc-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
      </button>
      
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
          <Shield className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">นโยบายความเป็นส่วนตัว</h1>
          <p className="text-zinc-500 text-xs font-semibold uppercase mt-1">อัปเดตล่าสุด: {new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-emerald-600 border-b border-zinc-100 pb-2">1. ข้อมูลที่เราเก็บรวบรวมอย่างละเอียด</h2>
          <div className="space-y-4 text-zinc-600 text-sm leading-relaxed">
            <p><strong>1.1 ข้อมูลระบุตัวตนและบัญชีผู้ใช้งาน:</strong> เมื่อคุณสมัครสมาชิก เราทำการจัดเก็บและประมวลผลข้อมูลอีเมล ชื่อผู้ใช้ รหัสผ่าน (ซึ่งถูกเข้ารหัสด้วยกระบวนการแฮชชิ่งที่ได้มาตรฐานทางอุตสาหกรรม โดยเราไม่สามารถรู้รหัสผ่านเดิมของคุณได้) ข้อมูลระดับการใช้งาน (Role/VIP) และเครดิตคงเหลือของคุณอย่างครบถ้วน ข้อมูลนี้เป็นส่วนสำคัญที่ระบบต้องใช้ในการรักษาบัญชีของคุณให้ปลอดภัย</p>
            <p><strong>1.2 ข้อมูลการทำธุรกรรม (Transaction Data) เต็มรูปแบบ:</strong> เพื่อความเป็นธรรมและความโปร่งใส ในทุกครั้งที่มีการทำธุรกรรมเติมเงิน ฝากเงิน หรือซื้อสินค้า เราจะเก็บข้อมูลบันทึกทั้งหมดอย่างละเอียด รวมถึงประทับเวลา (Timestamp) จำนวนเงิน เกตเวย์การชำระเงิน และหมายเลขอ้างอิง เพื่อให้สามารถตรวจสอบย้อนหลังในกรณีเกิดข้อพิพาท ประเมิน วิเคราะห์ และใช้เป็นข้อมูลต่อต้านกระบวนการฉ้อโกง (Anti-Fraud) ในระดับลึก</p>
            <p><strong>1.3 เทเลเมทรี (Telemetry) ข้อมูลรูปแบบการเข้าชมและ Log Files:</strong> ตามพระราชบัญญัติและการรับรองความปลอดภัยทางไซเบอร์ ระบบมีการเก็บบันทึกข้อมูลเครือข่าย IP Address, ค่า Browser User Agent, ระบบปฏิบัติการที่ใช้, หมายเลขพอร์ต และพฤติกรรมการเรียกใช้งาน API ของผู้บริโภคเข้าไว้เพื่อใช้เป็นหลักฐานยืนยันตัวต้นทาง และคัดกรองภัยคุกคามในระบบ โดยข้อมูลดังกล่าวจะถูกเก็บตามอายุความที่กฎหมายกำหนด</p>
            <p><strong>1.4 ข้อมูลจากการเชื่อมต่อคู่ค้า (External Providers API):</strong> กรณีที่คุณต้องการความสะดวกและทำการเชื่อมโยงบัญชีกับคู่ให้บริการภายนอก (เช่น Discord หรือ Telegram) เราจะเรียกเก็บข้อมูลโปรไฟล์สาธารณะ หรือ Token เพื่อใช้สำหรับการยืนยันสิทธิ์อัตโนมัติบนแพลตฟอร์มของเราเท่านั้น ไม่มีการดูดข้อความส่วนบุคคล หรือรายการแชทอื่นๆ อย่างเด็ดขาด</p>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-emerald-600 border-b border-zinc-100 pb-2">2. การปกป้องข้อมูล Combo และสินทรัพย์ของท่าน (Zero-Logging Assurance)</h2>
          <div className="space-y-4 text-zinc-600 text-sm leading-relaxed">
            <p>ทางทีมบริหารงานและวิศวกรของระบบ ขอยืนยันพันธสัญญาด้วยเกียรติว่า <strong>ระบบจะไม่มีพฤติกรรมการบันทึก, แอบขโมย, หรือทำการดักจับข้อมูลบัญชี (Combo) / รหัสผ่านเป้าหมายที่มีการใช้งานบนหน้าเว็บไปรวบรวมเป็นฐานข้อมูลส่วนตัวเพื่อผลประโยชน์อื่นใดทั้งสิ้น</strong></p>
            <p>การส่งผ่านคีย์ ข้อมูลบัญชี และพารามิเตอร์ต่างๆ ระหว่างฝั่งไคลเอนต์ (เบราว์เซอร์ของท่าน) สู่เซิร์ฟเวอร์ จะถูกดำเนินการบนโพรโทคอลเข้ารหัส HTTPS ความปลอดภัยสูงโดยทุกกระบวนการจะถูกจัดเก็บในหน่วยความจำชั่วคราว (Volatile Memory) เพื่อประมวลผลเซสชั่นเท่านั้น ข้อมูลดิบจะถูกทำลายและล้างออกทางเทคนิคในทันทีเมื่อประมวลผลสำเร็จ เพื่อความมั่นใจในระดับ 100%</p>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-emerald-600 border-b border-zinc-100 pb-2">3. นโยบายการเปิดเผยข้อมูลแก่บุคคลที่สามอย่างรัดกุม</h2>
          <div className="space-y-4 text-zinc-600 text-sm leading-relaxed">
            <p>แพลตฟอร์มตระหนักเสมอว่าข้อมูลของคุณคือสิทธิ์ขาดของคุณ เรามีนโยบายควบคุมระดับองค์กรที่จะไม่นำข้อมูลส่วนตัว อีเมล หรือฐานข้อมูลประวัติใดๆ ของคุณไปมอบ แจกจ่าย จำหน่าย เผยแพร่ หรือแลกเปลี่ยนผลประโยชน์กับบุคคลภายนอก หรือองค์กรที่สามโดยเด็ดขาด <em className="text-emerald-700">ยกเว้นในกรณีที่มีเงื่อนไขบังคับต่อไปนี้:</em></p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>การส่งมอบให้ผู้ให้บริการประมวลผลรายหลัก (Essential Service Providers):</strong> เพื่อให้ระบบทำงานได้ เช่น การส่งต่อข้อมูลยอดชำระให้กับระบบ Payment Gateway ตามสิทธิอย่างเคร่งครัด</li>
              <li><strong>ความร่วมมือในการบังคับใช้กฎหมาย:</strong> การมอบข้อมูลให้กับพนักงานเจ้าหน้าที่ ตามหมายเรียกของศาล หน่วยงานด้านกฎหมาย การบังคับใช้ หรือเพื่อกระบวนการยุติธรรมที่มีบรรทัดฐานอย่างเป็นทางการ</li>
              <li><strong>การระงับภัยคุกคาม:</strong> เพื่อการวินิจฉัย การปกป้องผลประโยชน์ของแพลตฟอร์ม APEXSTORE หรือนำไปใช้คดีทางแพ่ง-อาญาสำหรับผู้ที่ทำตัวเป็นอาชญากรไซเบอร์ (เช่น ผู้ก่อเหตุ DDoS หรือโจมตีระบบ)</li>
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-emerald-600 border-b border-zinc-100 pb-2">4. สิทธิของเจ้าของข้อมูล และการติดต่อเพื่อสิทธิ</h2>
          <div className="space-y-4 text-zinc-600 text-sm leading-relaxed">
            <p>ผู้ใช้แพลตฟอร์มทุกคนมีสิทธิที่จะเป็นผู้แจ้งยุติ หรือปรับปรุงการจัดเก็บข้อมูลของตน:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>สิทธิขอเข้าถึงและขอรับสำเนา:</strong> คุณมีสิทธิดาวน์โหลดประวัติการซื้อของ หรือใบเสร็จที่เคยทำในแพลตฟอร์มของเราได้</li>
              <li><strong>สิทธิขอแก้ไข:</strong> การเปลี่ยนแปลงรหัสผ่าน อีเมล ผ่านระบบ Dashboard ทำได้ตลอดเวลาด้วยตนเอง</li>
              <li><strong>สิทธิการขอลบ (Right to be Forgotten):</strong> คุณมีสิทธิ์ที่จะติดต่อแจ้งให้แอดมินลบฐานข้อมูลผู้ใช้ของคุณออกจากระบบได้ อย่างไรก็ตาม เราสงวนสิทธิ์ที่จะปฎิเสธการลบและค้างเก็บข้อมูลประวัติธุรกรรมเพื่อล้อมคอกป้องกันผู้ขอใช้งานที่หนีการฉ้อโกง (Audit Compliance)</li>
            </ul>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export const TermsView: React.FC<PolicyViewProps> = ({ onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto w-full font-sans text-zinc-850 pb-32"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 text-sm font-medium transition-colors mb-8 cursor-pointer bg-white border border-zinc-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
      </button>
      
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 shadow-sm">
          <ListChecks className="w-6 h-6 text-rose-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">ข้อกำหนดและเงื่อนไขการใช้บริการ</h1>
          <p className="text-zinc-400 mt-1">อัปเดตล่าสุด: {new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-rose-600 border-b border-zinc-100 pb-2">1. การรับรองความยินยอมและผูกพัน</h2>
          <div className="space-y-4 text-zinc-600 text-sm leading-relaxed">
            <p>การดำเนินการใดๆ บนหน้าเว็บไซต์ ซึ่งรวมไปถึงการคลิกเข้าสู่ระบบ การเข้าแท็บสั่งซื้อ หรือการรันเครื่องมือต่างๆ บนแพลตฟอร์มของเรา ถือเป็นภาระทางแพ่งที่คุณยินยอมและยอมรับเงื่อนไขการใช้บริการของ <strong>APEXSTORE</strong> ทันทีอย่างไม่อาจเพิกถอนได้ องค์ประกอบและกฎเหล่านี้ถูกตราไว้เพื่อคุ้มครองความปลอดภัยของผู้ใช้โดยรวม ควบคุมกรอบการใช้งาน และยืนยันความรับผิดชอบของตัวลูกค้าเอง หากท่านไม่ยินยอมหรือไม่เห็นด้วยกับมาตรการ กฎกติกา ข้อตกลง และพันธสัญญาข้อใดข้อหนึ่ง กรุณายุติการเข้าใช้งาน ปิดหน้าต่าง และปฏิเสธการโอนเงินโดยทันที</p>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-rose-600 border-b border-zinc-100 pb-2">2. ขอบเขตสิทธิ์ หน้าที่ และการใช้งานที่ต้องห้าม (Strict AUP)</h2>
          <div className="space-y-4 text-zinc-600 text-sm leading-relaxed">
            <p>แพลตฟอร์ม APEXSTORE อนุญาตให้ผู้ใช้งานที่ประพฤติตนดี ได้รับสิทธิ์ในการใช้ระบบนิเวศและ API อย่างโปร่งใส การใช้งานที่ละเมิดข้อจำกัดต่อไปนี้จะส่งผลเด็ดขาดให้บัญชีและยอดคงเหลือทั้งหมดของคุณถูกทำการระงับ ทรัพย์สินและสิทธิ์จะถูกยึดรวมเป็นค่าปรับทันที:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>การห้ามวิศวกรรมย้อนกลับ ดัดแปลง หรือฉ้อฉลโครงสร้าง (Reverse Engineering & Spoofing):</strong> ผู้ใช้จะต้องไม่ทำการแคปเจอร์ ดักจับ พยายามแกะซอร์สโค้ด (Decompile) วิเคราะห์ช่องโหว่ รันสคริปต์ก่อกวน โอนโทเค็นเถื่อน ดัดแปลงค่าหน่วยความจำ (Memory Editing) หรือนำ API ไปลักลอบใช้งานต่อ (Bypass Integration) หากตรวจพบ เครื่องมือจับตาจะเตะคุณออกจากระบบเครือข่ายโดยอัตโนมัติ</li>
              <li><strong>การกระทำละเมิดกติกาแพลตฟอร์มอย่างร้ายแรง (Network Abuse / DoS / DDoS):</strong> ห้ามมิให้ส่งแพ็กเกจโจมตี กระหน่ำส่ง Request หรือยิงคำสั่งที่ไร้เหตุผลเพื่อจงใจลดประสิทธิภาพ ทำร้ายโครงสร้างเซิร์ฟเวอร์ (Stress Test) หากดำเนินการ องค์กรจะโอนรอยประทับของคุณให้แก่กลุ่มบริการ Cloud Flare และกฎหมายบ้านเมือง</li>
              <li><strong>ข้อพิพาทความชอบธรรมด้วยข้อมูลส่วนตัว (Third-party Property Accountability):</strong> เครื่องมือและ API ซื้อขาย/เช็คของ มีขึ้นเพื่อตอบสนองการจัดการบัญชีที่เป็นกรรมสิทธิ์ที่ท่านมีชอบธรรมเท่านั้น หากมีการนำเครื่องมือของระบบไปใช้ในทางการละเมิดข้อมูล บ่อนทำลาย สร้างความเสียหาย หรือล้วงตับผู้อื่น สิทธิ ความผิดบาป และภาระรับผิดชอบความเสียหาย ถือเป็นของผู้ใช้รายนั้น 100% ทีมงานไม่มีส่วนต่อการกระทำดังกล่าว</li>
              <li><strong>การลอกเลียน แอบอ้าง ฉ้อฉลทางการค้า (Impersonation & Phishing):</strong> ทรัพย์สิน รูปแบบ ดีไซน์ ลายเส้น และข้อความทั้งหมดเป็นของ APEXSTORE การนำไปแอบอ้าง ลอกเลียน หรือไปดักต้มตุ๋นลูกค้านอกระบบ นำไปสู่การแบนเครือข่าย IP อย่างถาวร</li>
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-rose-600 border-b border-zinc-100 pb-2">3. ข้อตกลงแห่งการทำธุรกิจดิจิทัลและนโยบายไม่รับคืน (No Refund Principle)</h2>
          <div className="space-y-4 text-zinc-600 text-sm leading-relaxed">
            <p><strong>3.1 ความไม่อาจย้อนกลับของการทำธุรกรรม:</strong> เนื่องจากธุรกิจที่เกี่ยวกับ ซอฟต์แวร์ คีย์โปรแกรม (Digital Keys) ไอดี และเครดิตดิจิทัล (Digital Credits) นั้นเป็นสิ่งที่เมื่อกระทำการส่งมอบแล้วจะไม่สามารถนำสินค้าไปรีเซ็ตหรือหมุนเวียนขายผู้ใช้ท่านอื่นได้ ดังนั้น ทุกการเติมเงิน ทุกการซื้อคีย์ ทุกการเช่าโปรแกรม และการทำรายการชำระซื้อบนร้านค้า ถือเป็นการสรุปสมบูรณ์ (Final Sale) และ <strong>ไม่สามารถเรียกร้องคืนเป็นเงินสดหรือการยกเลิกคืนยอด (Non-Refundable) ในทุกรณี</strong></p>
            <p><strong>3.2 การรับประกันแบบมีเงื่อนไข (Conditional Warranty):</strong> สำหรับสินค้าจำพวกรหัส คีย์ หรือบัญชีพรีเมียม จะได้รับการประกันเฉพาะตามระยะเวลาและคำอธิบายซับเซตในสินค้านั้น ๆ แบบเจาะจง หากลูกค้าทำรหัสสูญหาย เปลี่ยนพาส ทำให้บัญชีติดสถานะแบน หรือลืมเครดิตทิ้งไว้หลังพ้นสัญญาประกันไปแล้ว ทีมงานหมดความรับผิดชอบในการชดเชยทกชนิด</p>
            <p><strong>3.3 เครดิตลอยตัว (Floating Credits):</strong> ยอดเติมที่สะสมคงเหลือค้าง ไม่สามารถทำการย้ายบัญชี (Transfer) ให้แก่กระเป๋าผู้อื่นหรือบัญชีสาขาได้</p>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-rose-600 border-b border-zinc-100 pb-2">4. ข้อจำกัดความรับผิดชอบและข้อยกเว้นทางกฎหมาย (Liability Disclaimer)</h2>
          <div className="space-y-4 text-zinc-600 text-sm leading-relaxed">
            <p><strong>4.1 สถานะเชิงเทคนิค (Technical "As Is"):</strong> เราสร้างแพลตฟอร์มนี้อย่างสุดฝีมือที่สุด แต่เราสงวนสิทธิ์ให้บริการภายใต้นิยาม "ตามสภาพ (As Available & As Is)" นั่นคือเราไม่สามารถรับรองความสมบูรณ์ตลอด 100% อาจจะมีความหน่วง ข้อผิดพลาด และช่วงพักฉุกเฉิน</p>
            <p><strong>4.2 ขอบเขตอิสระจากบุคคลที่สาม (No Third-Party Affiliation):</strong> เครื่องมือตรวจสอบ การล็อกอิน หรือรหัสสต็อกทั้งหมด เป็นการทำงานบนกระบวนท่าของ Third-party APEXSTORE มีสถานะเป็นตลาดและเครื่องมือ ไม่มีส่วนเกี่ยวพัน เป็นตัวแทนรับรอง หรือขึ้นตรงกับบริษัทแม่หรือเจ้าของโซเชียลแต่อย่างใด</p>
            <p><strong>4.3 ขอยกเว้นภาระผูกพันเชิงพฤตินัย (Damages Immunity):</strong> เราปฏิเสธที่จะรับผิดชอบ ต่อส่วนรวม ต่อผู้ซื้อ หรือบุคคลาธรรม ในความเสื่อมถอย เสียหาย โอกาสสูญหาย กำไรหดหาย ยอดวิวตก หรือความพังพินาศในระบบเชิงธุรกิจทั้งปวงที่สืบเนื่องมาจากการนำเอาผลิตภัณฑ์ บัญชี หรือข้อมูลบอทจากเราไปใช้</p>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-rose-600 border-b border-zinc-100 pb-2">5. อำนาจสูงสุดของทีมงานระดับแอดมินิสเตรเตอร์ (Admin Absolute Authority)</h2>
          <div className="space-y-4 text-zinc-600 text-sm leading-relaxed">
            <p>การบริหารงานและสิทธิบัญชาการขั้นสูงสุด (Ultimate Veto) เป็นไปตามดุลพินิจและการจัดการของแอดมินิสเตรเตอร์แห่ง APEXSTORE ทุกระดับ หากแอดมินพิจารณาประจักษ์ว่าคุณมีความน่าจะละเมิด ต่อต้าน หมิ่นประมาท ทำให้เสื่อมเสีย แฮ็กระบบ ดื้อดึง ฉ้อฉลการเติมเงิน หรือสร้างภาวะ Toxic ให้แก่สังคม หรือทำพฤติกรรมผิดธรรมเนียม:</p>
            <p>ทีมงานขอใช้สิทธิ์สูงสุดที่เด็ดขาด ในการถางทาง <strong className="text-rose-700">เตะ ล็อค สั่งระงับบัญชี ขังบัญชี ทำสถานะ Void ท้ายที่สุดริบเครดิตในทันที และทำการประหาร IP Block</strong> โดยมิพักต้องเตือน ชี้แจง ร้องขอความเห็นใจ หรือรับเรื่องคำร้องจากเจ้าทุกข์แต่อย่างใด</p>
          </div>
        </section>
      </div>

      <div className="mt-16 text-center text-zinc-400 text-sm pb-8 border-b border-zinc-200 font-medium">
        <p>คุณมาถึงจุดนี้ได้ นั่นหมายความว่าคุณเคารพและทำความเข้าใจมันอย่างเต็มเปี่ยม</p>
        <p className="mt-2 text-rose-600 font-bold">-- ขอให้คุณโชคดีในโลกของ Sunoid.shop --</p>
      </div>
    </motion.div>
  );
};
