"use client";

import React from "react";

/**
 * VHOUSE SPACE — homepage clone
 * เว็บเช่าเว็บไซต์ (Apple Store–style layout)
 * Single-file TSX component. Drop into a Next.js / React + Tailwind project.
 */

const NAV_LINKS = [
  { label: "เช่าเว็บไซต์", href: "/model" },
  { label: "ร้าน", href: "/store" },
  { label: "เติมเงิน", href: "/topup" },
];

const PRODUCTS = [
  {
    id: "vhouse-space",
    eyebrow: "VHOUSE SPACE",
    title: "VHOUSE SPACE",
    desc: "แพลตฟอร์มเช่าเว็บไซต์ของเรา",
    cta: "เรียนรู้เพิ่มเติม",
    href: "/store",
    image: "https://img2.pic.in.th/pic/Screenshot-2025-10-31-145506.png",
    dark: true,
  },
  {
    id: "webchao",
    eyebrow: "WEBCHAO",
    title: "WEBCHAO",
    desc: "เทมเพลตเว็บไซต์สำเร็จรูป ใช้งานง่าย",
    cta: "ดูรายละเอียด",
    href: "/store",
    image: "https://img5.pic.in.th/file/secure-sv1/Screenshot-2025-10-31-145511.png",
    dark: false,
  },
  {
    id: "professional",
    eyebrow: "PROFESSIONAL",
    title: "PROFESSIONAL",
    desc: "สำหรับธุรกิจที่ต้องการความเป็นมืออาชีพ",
    cta: "ดูรายละเอียด",
    href: "/store",
    image: "https://img2.pic.in.th/pic/Screenshot-2025-10-31-145515.png",
    dark: true,
  },
];

const FOOTER_COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "เลือกซื้อและเรียนรู้",
    links: [
      { label: "ร้าน", href: "/store" },
      { label: "เช่าเว็บไซต์", href: "/store" },
    ],
  },
  {
    heading: "บัญชี",
    links: [
      { label: "จัดการบัญชีของคุณ", href: "/profile" },
      { label: "โปรไฟล์", href: "/profile" },
    ],
  },
  {
    heading: "VHOUSE Store",
    links: [
      { label: "ร้านค้า", href: "/store" },
      { label: "เช่าเว็บไซต์", href: "/store" },
      { label: "เติมเงิน", href: "/topup" },
    ],
  },
  {
    heading: "เกี่ยวกับ VHOUSE",
    links: [
      { label: "หน้าแรก", href: "/" },
      { label: "เข้าร่วม Discord", href: "https://discord.gg/yF6SCWvg" },
    ],
  },
];

export const HomeView = (props: any) => {

  return (
    <div className="bg-white text-[#1d1d1f] antialiased pb-24 lg:pb-0">
      {/* ===== Hero ===== */}
      <section className="flex flex-col items-center bg-gradient-to-b from-[#fbfbfd] to-[#f5f5f7] px-6 pb-12 pt-16 text-center text-[#1d1d1f]">
        <p className="text-sm font-semibold text-[#86868b]">VHOUSE SPACE</p>
        <h1 className="mt-2 text-[48px] md:text-[64px] font-semibold tracking-tight leading-tight">
          VHOUSE SPACE
        </h1>
        <p className="mt-4 text-xl text-[#86868b] sm:text-[28px]">เช่าเว็บไซต์ราคาถูก</p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-base md:text-[19px]">
          <a href="/store" className="text-[#06c] hover:underline">
            ดูรายละเอียด&nbsp;&gt;
          </a>
          <a href="/store" className="text-[#06c] hover:underline">
            เลือกซื้อ&nbsp;&gt;
          </a>
        </div>

        <div className="mt-14 w-full max-w-5xl overflow-hidden rounded-2xl shadow-xl border border-black/5">
          <img
            src="https://img5.pic.in.th/file/secure-sv1/Screenshot-2025-10-31-145454.png"
            alt="MODELV"
            className="w-full object-cover"
          />
        </div>
      </section>

      {/* ===== MODELV feature strip ===== */}
      <section className="bg-white px-6 py-20 text-center border-t border-black/5">
        <p className="text-sm font-semibold text-[#f56300]">ใหม่</p>
        <h2 className="mt-2 text-[40px] md:text-[56px] font-semibold tracking-tight leading-tight">MODELV</h2>
        <p className="mt-4 text-[21px] text-[#1d1d1f] md:text-[24px]">
          เช่าเว็บไซต์เริ่มต้นที่ ฿199
        </p>
        <a
          href="/store"
          className="mt-5 inline-block text-[19px] text-[#06c] hover:underline"
        >
          ดูรายละเอียด&nbsp;&gt;
        </a>

        <div className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-2xl border border-black/5 shadow-lg">
          <img
            src="https://img.youtube.com/vi/h0Bqtjj6SRQ/maxresdefault.jpg"
            alt="ชมเว็บตัวอย่าง MODELV"
            className="w-full object-cover"
          />
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-4 text-[14px] text-[#1d1d1f] font-semibold">
          <span className="rounded-full bg-black/[0.04] px-4 py-1.5">ได้รับทันที</span>
          <span className="rounded-full bg-black/[0.04] px-4 py-1.5">พร้อมใช้งาน</span>
        </div>
      </section>

      {/* ===== Product grid ===== */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 max-w-[2560px] mx-auto bg-white">
        {PRODUCTS.map((p) => (
          <article
            key={p.id}
            className={`flex flex-col items-center px-8 pt-16 pb-0 text-center overflow-hidden h-[580px] justify-between relative rounded-3xl ${
              p.dark ? "bg-black text-[#f5f5f7]" : "bg-[#fbfbfd] text-[#1d1d1f]"
            }`}
          >
            <div className="z-10 w-full">
              <p className={`text-sm font-semibold ${p.dark ? "text-[#f56300]" : "text-[#f56300]"}`}>
                {p.eyebrow}
              </p>
              <h3 className="mt-2 text-[32px] md:text-[40px] font-semibold tracking-tight leading-tight">{p.title}</h3>
              <p className={`mt-3 text-[19px] ${p.dark ? "text-[#86868b]" : "text-[#1d1d1f]"}`}>
                {p.desc}
              </p>
              <a
                href={p.href}
                className="mt-4 text-[17px] inline-block text-[#2997ff] hover:underline"
              >
                {p.cta}&nbsp;&gt;
              </a>
            </div>
            <div className="mt-8 w-full max-w-[80%] mx-auto flex-1 flex items-end justify-center relative translate-y-4">
              <img src={p.image} alt={p.title} className="w-full h-auto object-cover object-top shadow-md border border-black/10 rounded-t-xl" />
            </div>
          </article>
        ))}
      </section>

      {/* ===== Top-up banner ===== */}
      <div className="p-4 bg-white">
          <section className="bg-[#fbfbfd] rounded-3xl mx-auto px-6 py-20 text-center text-[#1d1d1f] overflow-hidden relative border border-black/[0.02]">
            <div className="relative z-10 max-w-2xl mx-auto">
                <p className="text-sm font-semibold text-[#86868b] mb-2 uppercase tracking-wide">Payments</p>
                <h3 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-tight">เติมเงินเข้าระบบ</h3>
                <p className="mt-4 text-[21px] text-[#1d1d1f]">เติมเงินง่าย ใช้ซื้อเว็บไซต์และบริการได้ทันที รวดเร็วและปลอดภัย</p>
                <div className="flex gap-4 justify-center mt-6">
                    <a
                    href="/topup"
                    className="inline-block rounded-full bg-[#0071e3] px-6 py-3 text-[17px] font-semibold text-white hover:bg-[#0077ED] transition-colors"
                    >
                    เติมเงินตอนนี้
                    </a>
                </div>
            </div>
          </section>
      </div>
    </div>
  );
};
