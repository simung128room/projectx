# -*- coding: utf-8 -*-
# 🦖 ดักซองทำเอง 7.6.4 — UltraRace 0.001 Edition (UltraRace Mode)
# UltraFast Redeem (race httpx + aiohttp + cloudscraper) + SlowVerify (queue)
# ✅ ยิงพร้อมกันทุกซองด้วยเบอร์ TMOBILE1 + TMOBILE2
# ✅ เก็บทุกระบบเดิมของ 7.6 (Beautiful Log, Heartbeat, Webhook, Bypass CF, FixLoop)
#
# Requirements:
#   pip install telethon httpx aiohttp cloudscraper pillow pyzbar opencv-python colorama

import os, re, io, json, time, random, asyncio, sys, traceback, statistics
from datetime import datetime, timezone, date
from collections import deque, defaultdict

# uvloop (Linux เท่านั้น; Windows ข้ามให้เอง)
try:
    import uvloop
    asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
except Exception:
    pass

# Telethon
from telethon import TelegramClient, events
from telethon.sessions import StringSession
from telethon.errors import FloodWaitError, RPCError
from telethon.tl.types import (UpdateNewMessage, UpdateNewChannelMessage,
                               UpdateEditMessage, UpdateEditChannelMessage,
                               DocumentAttributeFilename)

# HTTP clients
import httpx, aiohttp
try:
    import cloudscraper
    CLOUDSCRAPER_AVAILABLE = True
except Exception:
    CLOUDSCRAPER_AVAILABLE = False

# QR libs
from PIL import Image, UnidentifiedImageError
try:
    from pyzbar.pyzbar import decode as qr_decode
except Exception:
    qr_decode = None

# colors
try:
    import colorama; colorama.just_fix_windows_console()
except Exception:
    pass
GREEN="\033[92m"; YELLOW="\033[93m"; RED="\033[91m"; RESET="\033[0m"
CYAN="\033[96m"; BLUE="\033[94m"; GRAY="\033[90m"; MAG="\033[95m"

# ========= CONFIG =========
API_ID   = int(os.getenv("TG_API_ID", "247035"))
API_HASH = os.getenv("TG_API_HASH", "5474578da06c8076e3cdf098b13ee8")

# 🔄 รองรับหลายเบอร์ (ยิงทุกเบอร์พร้อมกันทุกซอง)
PHONE_NUMBERS = [
    os.getenv("TMOBILE1", "06183789"),
    os.getenv("TMOBILE2", "09407114"),
]
PHONE_NUMBERS = [p.strip() for p in PHONE_NUMBERS if p and p.strip()]
if not PHONE_NUMBERS:
    PHONE_NUMBERS = ["06183789", "09407114"]

SESSION_FILES = [s.strip() for s in os.getenv("SESSION_FILES", "").split(",") if s.strip()]
if not SESSION_FILES:
    SESSION_FILES = ["session.txt"]

WEBHOOK_SUCCESS = os.getenv("WEBHOOK_SUCCESS", "https://discord.com/api/webhooks/1434291470097186987/UKDlyp3XaIMKIHuBdM0cke0k5FZ0QVjfSHnJlph8nMT9V8NsbEeTeYR0P9Kcb6cQ7O4M")
WEBHOOK_FAIL    = os.getenv("WEBHOOK_FAIL", "https://discord.com/api/webhooks/1434291467622551583/PwGT5msZrzD3fuA58AkfIOwXxWQhmVqhyYn2jC06krLn7H3ORtL6I-Vs12oHKyko3L5M")

WEBHOOK_THUMB   = os.getenv("WEBHOOK_THUMB_URL", "https://img2.pic.in.th/pic/-598-x-598-px-1.png")

CONCURRENCY        = int(os.getenv("CONCURRENCY", "300"))   # ยิงพร้อมกันสูงสุด (รวมทุกเบอร์)
VERIFY_CONCURRENCY = int(os.getenv("VERIFY_CONCURRENCY", "100"))  # worker ตรวจสอบ
TIMEOUT_S_MIN = float(os.getenv("TIMEOUT_MIN", "0.001"))
TIMEOUT_S_MAX = float(os.getenv("TIMEOUT_MAX", "0.05"))
CONNECT_TIMEOUT_S  = float(os.getenv("CONNECT_TIMEOUT", "0.02"))
MAX_CONNECTIONS    = int(os.getenv("MAX_CONNECTIONS", "400"))
HTTP2              = True
USE_CLOUDSCRAPER   = True
COOKIE_FILE        = os.getenv("CF_COOKIE_FILE", "cf_cookie.json")
WEBHOOK_TIMEOUT    = float(os.getenv("WEBHOOK_TIMEOUT", "4.0"))
VERIFY_RETRIES     = int(os.getenv("VERIFY_RETRIES", "2"))
CF_REFRESH_SECS    = int(os.getenv("CF_REFRESH_SECS", "30"))  # 10 นาที

VERIFY_PROFILE_URL = os.getenv(
    "VERIFY_PROFILE_URL",
    "https://profile-images-cdn.truemoney.com/a00460b1f55e47e59679b26aa0905f76.jpg"
)

# regex patterns (รวม voucher_detail)
RE_EXACT  = re.compile(r"https://gift\.truemoney\.com/campaign/\?v=([A-Za-z0-9]{6,120})")
RE_VOUCH  = re.compile(r"https://gift\.truemoney\.com/campaign/vouchers/([A-Za-z0-9]{6,120})")
RE_DETAIL = re.compile(r"https://gift\.truemoney\.com/campaign/voucher_detail\?v=([A-Za-z0-9]{6,120})")
RE_ANYTM  = re.compile(r"https://gift\.truemoney\.com/[^\s]+")

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
]

TRANSLATE = {
    "Voucher ticket is out of stock.": "❌ ซองนี้ถูกใช้หมดแล้ว",
    "Voucher has been fully redeemed": "❌ ซองนี้ถูกใช้หมดแล้ว",
    "This voucher was already claimed": "⚠️ ซองนี้ถูกใช้ไปแล้ว",
    "Voucher not found": "❌ ไม่พบซองนี้ในระบบ TrueMoney",
    "Invalid voucher": "❌ ซองอั่งเปาไม่ถูกต้อง",
    "Voucher is expired.": "⏰ ซองนี้หมดอายุแล้ว",
    "Target user redeeming the voucher.": "⚠️ เบอร์นี้เคยรับซองนี้ไปแล้ว",
    "Invalid phone number": "📵 หมายเลขโทรศัพท์ไม่ถูกต้อง",
    "Something went wrong.": "⚠️ เกิดข้อผิดพลาดจากระบบทรูมันนี่"
}

# ===== Runtime stats =====
daily_total = 0.0
daily_date = date.today()
def add_amount(amt: float):
    global daily_total, daily_date
    today = date.today()
    if daily_date != today:
        daily_date = today; daily_total = 0.0
    daily_total += amt; return daily_total

def th_now_label(): return datetime.now().strftime("วันนี้ เวลา %H:%M")

# ===== Dedup & latency =====
_recent_codes={}; _recent_order=deque(maxlen=20000)
def dedup(code:str)->bool:
    now=time.time()
    if code in _recent_codes and (now-_recent_codes[code])<180: return False
    _recent_codes[code]=now; _recent_order.append(code)
    return True

_last_texts=defaultdict(lambda: deque(maxlen=3))
def collect_codes_from_text(text:str):
    s=set()
    s.update(RE_EXACT.findall(text)); s.update(RE_VOUCH.findall(text)); s.update(RE_DETAIL.findall(text))
    return list(s)

_latency_samples=deque(maxlen=300)
def current_timeout():
    if not _latency_samples: return TIMEOUT_S_MAX
    p50=statistics.median(_latency_samples); t=max(TIMEOUT_S_MIN, min(TIMEOUT_S_MAX, (p50/1000.0)*2.0)); return t

# ---------- Overdrive HTTP ----------
class OverdriveHTTP:
    def __init__(self):
        self.hx=None; self.aio=None; self.scr=None
        self._hdrbase = {
            "Accept":"application/json, text/plain, */*",
            "Accept-Language":"th-TH,th;q=0.9,en;q=0.8",
            "Origin":"https://gift.truemoney.com",
            "Referer":"https://gift.truemoney.com/",
            "Content-Type":"application/json",
            "Connection":"keep-alive"
        }

    async def init(self):
        limits = httpx.Limits(max_connections=MAX_CONNECTIONS, max_keepalive_connections=MAX_CONNECTIONS)
        self.hx = httpx.AsyncClient(http2=HTTP2, limits=limits,
                                    timeout=httpx.Timeout(timeout=current_timeout(),
                                                          connect=CONNECT_TIMEOUT_S,
                                                          read=current_timeout(),
                                                          write=current_timeout()))
        self.aio = aiohttp.ClientSession(connector=aiohttp.TCPConnector(limit=MAX_CONNECTIONS, ssl=False))
        if CLOUDSCRAPER_AVAILABLE and USE_CLOUDSCRAPER:
            self.scr = cloudscraper.create_scraper(browser={'browser':'chrome','platform':'windows','desktop':True})
            try:
                # preload เพื่อ cf_clearance/cookies
                self.scr.get("https://gift.truemoney.com/campaign/", timeout=5)
                print(f"⚙️ Cloudflare preload OK")
            except Exception as e:
                print(f"⚠️ preload CF failed: {e}")
            if os.path.exists(COOKIE_FILE):
                try:
                    ck=json.load(open(COOKIE_FILE,"r",encoding="utf-8"))
                    self.scr.cookies.update(ck)
                    print(f"🍪 โหลดคุกกี้ CF จากไฟล์")
                except Exception as e:
                    print(f"⚠️ โหลดคุกกี้ล้มเหลว: {e}")

    def headers(self):
        h=dict(self._hdrbase); h["User-Agent"]=random.choice(USER_AGENTS); return h

    # ---------- ยิง redeem (สำหรับ 1 เบอร์) ----------
    async def _redeem_httpx(self, code, phone):
        url=f"https://gift.truemoney.com/campaign/vouchers/{code}/redeem"
        body={"mobile": phone, "voucher_hash": code}
        t0=time.perf_counter()
        try:
            r=await self.hx.post(url, headers=self.headers(), json=body, timeout=current_timeout())
            dt=(time.perf_counter()-t0)*1000; ct=r.headers.get("content-type","")
            text=r.text or ""
            if "application/json" in ct:
                try: data=r.json()
                except: data={"status":{"message":"JSON parse error"}}
            else:
                data={"status":{"message":"HTML response"}}
            return ("httpx", dt, {"status":r.status_code,"data":data,"raw":text[:400]})
        except Exception as e:
            dt=(time.perf_counter()-t0)*1000; return ("httpx", dt, {"status":None,"error":str(e),"raw":""})

    async def _redeem_aiohttp(self, code, phone):
        url=f"https://gift.truemoney.com/campaign/vouchers/{code}/redeem"
        body={"mobile": phone, "voucher_hash": code}
        t0=time.perf_counter()
        try:
            async with self.aio.post(url, json=body, headers=self.headers(), timeout=current_timeout()) as r:
                text=await r.text(); dt=(time.perf_counter()-t0)*1000; ct=r.headers.get("content-type","")
                if "application/json" in ct:
                    try: data=await r.json()
                    except: data={"status":{"message":"JSON parse error"}}
                else:
                    data={"status":{"message":"HTML response"}}
                return ("aiohttp", dt, {"status":r.status,"data":data,"raw":text[:400]})
        except Exception as e:
            dt=(time.perf_counter()-t0)*1000; return ("aiohttp", dt, {"status":None,"error":str(e),"raw":""})

    async def _redeem_scraper(self, code, phone):
        def _do():
            base="https://gift.truemoney.com"
            try:
                self.scr.get(f"{base}/campaign/?v={code}", timeout=1.5)
            except:
                pass
            url=f"{base}/campaign/vouchers/{code}/redeem"
            t0=time.perf_counter()
            try:
                r=self.scr.post(url, json={"mobile":phone,"voucher_hash":code}, timeout=5)
                dt=(time.perf_counter()-t0)*1000; ct=r.headers.get("content-type","")
                text=r.text or ""
                if "application/json" in ct:
                    try: data=r.json()
                    except: data={"status":{"message":"JSON parse error"}}
                else:
                    data={"status":{"message":"HTML response"}}
                try: json.dump(self.scr.cookies.get_dict(), open(COOKIE_FILE,"w",encoding="utf-8"))
                except: pass
                return ("cloudscraper", dt, {"status":r.status_code,"data":data,"raw":text[:400]})
            except Exception as e:
                dt=(time.perf_counter()-t0)*1000; return ("cloudscraper", dt, {"status":None,"error":str(e),"raw":""})
        return await asyncio.to_thread(_do)

    # race: httpx / aiohttp / cloudscraper สำหรับ "1 เบอร์"
    async def redeem_race(self, code, phone):
        racers=[asyncio.create_task(self._redeem_httpx(code, phone)),
                asyncio.create_task(self._redeem_aiohttp(code, phone))]
        if CLOUDSCRAPER_AVAILABLE and USE_CLOUDSCRAPER and self.scr is not None:
            racers.append(asyncio.create_task(self._redeem_scraper(code, phone)))
        done, pending = await asyncio.wait(racers, return_when=asyncio.FIRST_COMPLETED)
        brand, ms, res = list(done)[0].result()
        for p in pending: p.cancel()
        _latency_samples.append(ms)
        return brand, ms, res

    async def verify_code(self, code, phone):
        base="https://gift.truemoney.com"
        url=f"{base}/campaign/vouchers/{code}/verify?mobile={phone}"
        last_err=None
        for i in range(VERIFY_RETRIES+1):
            try:
                r=await self.hx.get(url, headers=self.headers(), timeout=current_timeout())
                text=r.text or ""; ct=r.headers.get("content-type","")
                if "application/json" in ct:
                    try: data=r.json()
                    except: data={"status":{"message":"JSON parse error"}}
                else:
                    raise ValueError("HTML response")
                return {"status":r.status_code,"data":data,"raw":text[:400],"content_type":ct}
            except Exception as e:
                last_err=e; await asyncio.sleep(0.08*(i+1))
        if CLOUDSCRAPER_AVAILABLE and self.scr is not None:
            def _do():
                rr=self.scr.get(url, headers=self.headers(), timeout=8)
                text=rr.text or ""; ct=rr.headers.get("content-type","")
                if "application/json" in ct:
                    try: data=rr.json()
                    except: data={"status":{"message":"JSON parse error"}}
                else:
                    data={"status":{"message":"HTML response"}}
                try: json.dump(self.scr.cookies.get_dict(), open(COOKIE_FILE,"w",encoding="utf-8"))
                except: pass
                return {"status":rr.status_code,"data":data,"raw":text[:400],"content_type":ct}
            return await asyncio.to_thread(_do)
        return {"status":None,"data":None,"error":str(last_err),"raw":"", "content_type":""}

    async def close(self):
        try:
            if self.hx: await self.hx.aclose()
        except: pass
        try:
            if self.aio: await self.aio.close()
        except: pass

# ===== Webhook =====
async def send_webhook_async(httpc: OverdriveHTTP, title: str, desc: str, color: int, url: str):
    if not url: return
    embed={
        "title":title,
        "description":desc,
        "color":color,
        "footer":{"text":"🦖 Hybrid Verify 7.6.3"},
        "timestamp":datetime.now(timezone.utc).isoformat()
    }
    if WEBHOOK_THUMB: embed["thumbnail"]={"url":WEBHOOK_THUMB}
    payload={"embeds":[embed]}
    try:
        await httpc.hx.post(url, json=payload, timeout=WEBHOOK_TIMEOUT)
    except Exception as e:
        print(f"⚠️ webhook fail: {e}")

# ===== QR decode =====
async def decode_qr_image(file_bytes: bytes) -> list[str]:
    results=[]
    if not file_bytes:
        return results
    try:
        if qr_decode:
            try:
                img=Image.open(io.BytesIO(file_bytes))
                img.verify()
                img=Image.open(io.BytesIO(file_bytes))
                codes=qr_decode(img)
                for c in codes:
                    v=c.data.decode("utf-8","ignore")
                    if "gift.truemoney.com" in v: results.append(v.strip())
                if results: return results
            except UnidentifiedImageError:
                print(f"⚠️ pyzbar failed: ไม่ใช่ไฟล์ภาพจริง")
            except Exception as e:
                print(f"⚠️ pyzbar failed: {e}")
    except Exception as e:
        print(f"⚠️ QR (pyzbar) wrapper error: {e}")
    try:
        import cv2, numpy as np
        npimg=np.frombuffer(file_bytes,np.uint8)
        if npimg.size==0:
            return results
        img=cv2.imdecode(npimg,cv2.IMREAD_COLOR)
        if img is None: return results
        det=cv2.QRCodeDetector(); val,_,_=det.detectAndDecode(img)
        if val and ("gift.truemoney.com" in val): results.append(val.strip()); return results
        for scale in (1.25,1.5,2.0):
            h,w=img.shape[:2]; img2=cv2.resize(img,(int(w*scale),int(h*scale)))
            v2,_,_=det.detectAndDecode(img2)
            if v2 and ("gift.truemoney.com" in v2):
                results.append(v2.strip()); break
    except Exception as e:
        print(f"⚠️ OpenCV failed: {e}")
    return results

def pick_message(data: dict, raw: str) -> str:
    msg=(data or {}).get("message") or (data or {}).get("status",{}).get("message") or ""
    if not msg and raw: msg=raw.strip()[:140]
    if "<!DOCTYPE" in (msg or "") or "HTML response" in (msg or ""):
        return "⚠️ ตอบกลับเป็น HTML (อาจหมดอายุ/โดนบล็อก/redirect)"
    return TRANSLATE.get(msg, msg or "")

GREEN_OK=0x00FF00; RED_BAD=0xFF0000
_sem=None
room_stats=defaultdict(lambda: {"found":0,"success":0,"fail":0})

# ===== VERIFY queue (fast redeem -> slow verify) =====
verify_queue: "asyncio.Queue" = asyncio.Queue()

# ===== Fast Redeem (ยิงทุกเบอร์พร้อมกัน) =====
async def redeem_for_phone(code: str, link: str, room: str, phone: str, httpc: OverdriveHTTP):
    global _sem
    if _sem is None:
        _sem = asyncio.Semaphore(CONCURRENCY)
    async with _sem:
        t0 = time.perf_counter()
        brand, ms, res = await httpc.redeem_race(code, phone)
        dur_redeem = max(time.perf_counter() - t0, 0.0001)  # กัน 0
        time_str = f"{dur_redeem:.2f} วินาที"

        if res.get("data") is None and res.get("error"):
            print(
                f"⚠️ ยิงรับเงินล้มเหลว (transport)\n"
                f"📱 เบอร์: {phone}\n"
                f"🧩 Engine: {brand}  ⏱ {time_str}\n"
                f"📣 ห้อง: {room}\n"
                f"💬 {res.get('error')}"
            )
            return

        print(
            f"▶️ ยิงรับเงินแล้ว (รอ verify)\n"
            f"📱 เบอร์: {phone}\n"
            f"🧩 Engine: {brand}  ⏱ {time_str}  ({ms:.0f} ms)\n"
            f"📣 ห้อง: {room}"
        )

        await verify_queue.put({
            "code": code, "link": link, "room": room,
            "engine": brand, "latency_ms": ms, "dur_redeem": dur_redeem,
            "phone": phone,
            "t0": time.time()
        })

async def redeem_then_queue_dual(code: str, link: str, room: str, httpc: OverdriveHTTP):
    # ยิงทุกเบอร์ใน PHONE_NUMBERS พร้อมกัน
    tasks=[]
    for phone in PHONE_NUMBERS:
        tasks.append(asyncio.create_task(redeem_for_phone(code, link, room, phone, httpc)))
    if tasks:
        await asyncio.gather(*tasks, return_exceptions=True)

# ===== Verify Worker (สรุปสวย + เวลาเป็นของช่วงยิง) =====
async def verify_worker(worker_id: int, httpc: OverdriveHTTP):
    while True:
        job = await verify_queue.get()
        code = job["code"]; link = job["link"]; room = job["room"]
        engine = job.get("engine","?"); ms = job.get("latency_ms",0)
        dur_redeem = float(job.get("dur_redeem", 0.0))
        phone = job.get("phone","")

        try:
            vres = await httpc.verify_code(code, phone)
            vdata = vres.get("data") or {}; raw = vres.get("raw") or ""; status_http = vres.get("status")
            voucher = (vdata.get("data") or {}).get("voucher",{}) or {}
            owner   = (vdata.get("data") or {}).get("owner_profile",{}) or {}
            tickets = (vdata.get("data") or {}).get("tickets") or []

            success=False; got_amount=0.0
            for t in tickets:
                if (t.get("profile_pic") or "") == VERIFY_PROFILE_URL:
                    success=True
                    try: got_amount=float(t.get("amount_baht") or 0.0)
                    except: got_amount=0.0
                    break

            status_msg=(vdata.get("status",{}) or {}).get("message","")
            status_th=pick_message(vdata, raw)

            summary_lines=[
                "🧧 สรุปซอง:",
                f"📦 มูลค่า: {voucher.get('amount_baht','-')} บาท",
                f"📌 สถานะ: {voucher.get('status','-')} ({status_th or status_msg or '—'})",
                f"👤 เจ้าของซอง: {owner.get('full_name','-')}",
                f"📱 ยิงด้วยเบอร์: {phone or '-'}",
            ]
            if tickets:
                t0_first=tickets[0]
                summary_lines.append(f"🎁 ผู้รับเงิน: {t0_first.get('full_name','-')} ({t0_first.get('mobile','-')})")
                summary_lines.append(f"💰 รับแล้ว: {t0_first.get('amount_baht','-')} บาท")
            summary_text="\n".join(summary_lines)

            if success:
                room_stats[room]["success"]+=1
                total=add_amount(got_amount)
                print(
                    f"✅ รับเงินยืนยันแล้ว\n"
                    f"💰 {got_amount:.2f} บาท\n"
                    f"🔗 {link}\n"
                    f"📣 ห้อง: {room}\n"
                    f"📱 เบอร์: {phone}\n"
                    f"⚡ {engine}={ms:.0f} ms | ⏱ {dur_redeem:.2f} วินาที\n"
                    f"🕐 {th_now_label()}\n"
                    f"{summary_text}\n"
                    f"💵 รวมวันนี้: {total:.2f} บาท"
                )
                desc=(
                    f"✅ รับเงินยืนยันแล้ว\n"
                    f"💰 {got_amount:.2f} บาท\n"
                    f"🔗 {link}\n"
                    f"📣 ห้อง: {room}\n"
                    f"📱 เบอร์: {phone}\n"
                    f"⚡ {engine}={ms:.0f} ms | ⏱ {dur_redeem:.2f} วินาที\n"
                    f"🕐 {th_now_label()}"
                )
                await send_webhook_async(httpc, "✅ สำเร็จ (verify)", desc, GREEN_OK, WEBHOOK_SUCCESS)
            else:
                room_stats[room]["fail"]+=1
                msg=pick_message(vdata, raw) or f"HTTP {status_http}"
                print(
                    f"❌ VERIFY ล้มเหลว (ไม่พบรูปตรงกัน)\n"
                    f"🔗 {link}\n"
                    f"💬 {msg}\n"
                    f"📣 ห้อง: {room}\n"
                    f"📱 เบอร์: {phone}\n"
                    f"⚡ {engine}={ms:.0f} ms | ⏱ {dur_redeem:.2f} วินาที\n"
                    f"🕐 {th_now_label()}\n"
                    f"{summary_text}"
                )
                desc=(
                    f"❌ ตรวจสอบแล้วไม่พบรูปตรงกัน\n"
                    f"🔗 {link}\n"
                    f"💬 {msg}\n"
                    f"📣 ห้อง: {room}\n"
                    f"📱 เบอร์: {phone}\n"
                    f"⚡ {engine}={ms:.0f} ms | ⏱ {dur_redeem:.2f} วินาที\n"
                    f"🕐 {th_now_label()}"
                )
                await send_webhook_async(httpc, "❌ ล้มเหลว (verify)", desc, RED_BAD, WEBHOOK_FAIL)
        except Exception as e:
            print(f"⚠️ verify_worker exception: {e}")
            traceback.print_exc()
        finally:
            verify_queue.task_done()

# ===== Scan & Dispatch =====
def scan_text_and_dispatch(chat_id, room, text, httpc:OverdriveHTTP):
    _last_texts[chat_id].append((text or "").strip())
    combined="\n".join(list(_last_texts[chat_id]))
    any_hit=False
    for u in RE_ANYTM.findall(combined):
        if not any_hit:
            print(f"🔎 ลิงก์ TM (debug): {u}")
            any_hit=True
    codes=collect_codes_from_text(combined)
    for code in codes:
        if dedup(code):
            link=f"https://gift.truemoney.com/campaign/?v={code}"
            room_stats[room]["found"]+=1
            print(f"💬 [{room}] พบลิงก์: {link}")
            # 🔥 ยิงทุกเบอร์พร้อมกัน
            asyncio.create_task(redeem_then_queue_dual(code, link, room, httpc))

def make_handlers(httpc:OverdriveHTTP):
    async def on_new(event):
        chat_id=event.chat_id
        room=getattr(event.chat,"title",None) or getattr(event.chat,"first_name",None) or str(chat_id)
        text=(event.raw_text or "").strip()
        if text:
            scan_text_and_dispatch(chat_id,room,text,httpc)
        try:
            if event.photo or (event.document and any(isinstance(a,DocumentAttributeFilename) for a in getattr(event, 'document', {}).attributes if getattr(event, 'document', None))):
                b=await event.download_media(bytes)
                links=await decode_qr_image(b)
                for link in links:
                    mm=RE_EXACT.search(link) or RE_VOUCH.search(link) or RE_DETAIL.search(link)
                    code=(mm.group(1) if mm else None)
                    if code and dedup(code):
                        room_stats[room]["found"]+=1
                        print(f"🖼️ [{room}] พบ QR: {link}")
                        asyncio.create_task(redeem_then_queue_dual(code,link,room,httpc))
        except Exception as e:
            msg=str(e)
            if "authorization is invalid" in msg:
                print(f"⚠️ อ่านรูปไม่ได้: auth media invalid (ข้าม)")
            else:
                print(f"⚠️ อ่านรูปไม่ได้: {e}")

    async def on_raw(update):
        try:
            if isinstance(update, (UpdateNewMessage, UpdateNewChannelMessage,
                                   UpdateEditMessage, UpdateEditChannelMessage)):
                msg = getattr(update, 'message', None) or getattr(getattr(update,'message',None),'message',None)
                peer = getattr(getattr(update, 'message', None), 'peer_id', None)
                if msg:
                    chat_id = getattr(peer, 'channel_id', None) or getattr(peer, 'chat_id', None) or getattr(peer, 'user_id', None) or 0
                    scan_text_and_dispatch(chat_id, f"peer:{chat_id}", msg, httpc)
        except Exception:
            pass
    return on_new, on_raw

# ===== Auto refresh Cloudflare cookie =====
async def auto_refresh_cookie(httpc:OverdriveHTTP):
    while True:
        try:
            if CLOUDSCRAPER_AVAILABLE and httpc.scr is not None:
                print(f"🌐 รีเฟรชคุกกี้ Cloudflare...")
                try:
                    httpc.scr.get("https://gift.truemoney.com/campaign/", timeout=5)
                    json.dump(httpc.scr.cookies.get_dict(), open(COOKIE_FILE,"w",encoding="utf-8"))
                except Exception as e:
                    print(f"⚠️ refresh cookie failed: {e}")
        except Exception as e:
            print(f"⚠️ auto_refresh_cookie error: {e}")
        await asyncio.sleep(CF_REFRESH_SECS)

# ===== Heartbeat =====
async def heartbeat(clients):
    while True:
        try:
            cnt_total=0
            for c in clients:
                async for _ in c.iter_dialogs(): cnt_total+=1
            p50=(statistics.median(_latency_samples) if _latency_samples else 0)
            succ=sum(v["success"] for v in room_stats.values()); fail=sum(v["fail"] for v in room_stats.values())
            print(f"💓 HEARTBEAT: ออนไลน์ เห็น {cnt_total} ห้อง | success={succ} fail={fail} | p50={p50:.0f} ms | รวมวันนี้ {daily_total:.2f} บาท")
        except Exception as e:
            print(f"⚠️ heartbeat: {e}")
        await asyncio.sleep(10)

# ===== Main =====
async def start_hybrid():
    # ✅ แก้ตรงนี้: สร้าง queue ใหม่ทุกครั้งที่เริ่ม loop
    global verify_queue
    verify_queue = asyncio.Queue()

    if API_ID == 0 or not API_HASH:
        print(f"❌ ตั้งค่า TG_API_ID / TG_API_HASH ก่อน")
        sys.exit(1)

    httpc = OverdriveHTTP()
    await httpc.init()

    global _sem
    _sem = asyncio.Semaphore(CONCURRENCY)
    clients = []

    print(f"============================================================================")
    print(f"🦖 ดักซองทำเอง 7.6.4 — UltraRace 0.001 Edition (UltraRace Mode)")
    print(f"📱 ใช้งานเบอร์: {', '.join(PHONE_NUMBERS)}")
    print(f"⚙️ CONCURRENCY={CONCURRENCY}, VERIFY_CONCURRENCY={VERIFY_CONCURRENCY}, MAX_CONN={MAX_CONNECTIONS}, TIMEOUT=[{TIMEOUT_S_MIN}-{TIMEOUT_S_MAX}]s, VERIFY_RETRIES={VERIFY_RETRIES}")
    print(f"🌐 Engines: httpx + aiohttp{' + cloudscraper' if (CLOUDSCRAPER_AVAILABLE and USE_CLOUDSCRAPER) else ''}")
    print(f"✅ เกณฑ์สำเร็จ: profile_pic == {VERIFY_PROFILE_URL}")
    print(f"============================================================================")

    for sf in SESSION_FILES:
        session_string = open(sf, "r", encoding="utf-8").read().strip() if os.path.exists(sf) else ""
        client = TelegramClient(StringSession(session_string), API_ID, API_HASH)
        try:
            await client.start(phone=lambda: input(f"📱 เบอร์ Telegram สำหรับ {sf} (ครั้งแรก OTP): ").strip())
            try:
                with open(sf, "w", encoding="utf-8") as f:
                    f.write(client.session.save())
                    print(f"✅ บันทึก session: {sf}")
            except:
                pass
        except RPCError as e:
            print(f"⚠️ Session สำหรับ {sf} มีปัญหา: {e}")
            if os.path.exists(sf):
                os.remove(sf)
            continue

        print(f"📋 รายชื่อห้องสำหรับ {sf}:")
        k = 0
        async for d in client.iter_dialogs():
            k += 1
            print(f"   {k}. {d.name} ({d.id})")
        print(f"📡 ฟังจาก {k} ห้อง ด้วย {sf}")

        on_new, on_raw = make_handlers(httpc)
        client.add_event_handler(on_new, events.NewMessage(incoming=True))
        client.add_event_handler(on_new, events.MessageEdited(incoming=True))
        client.add_event_handler(on_raw, events.Raw())
        clients.append(client)

    # ✅ start verify workers (ใช้ queue ของรอบนี้)
    for i in range(VERIFY_CONCURRENCY):
        asyncio.create_task(verify_worker(i, httpc))

    # auto refresh cookie task
    if CLOUDSCRAPER_AVAILABLE and USE_CLOUDSCRAPER and getattr(httpc, 'scr', None) is not None:
        asyncio.create_task(auto_refresh_cookie(httpc))

    asyncio.create_task(heartbeat(clients))

    # ----- Auto reconnect loop -----
    while True:
        try:
            await asyncio.gather(*(c.run_until_disconnected() for c in clients))
        except FloodWaitError as fw:
            print(f"⏳ FloodWait {fw.seconds}s — รอแล้วเชื่อมใหม่")
            await asyncio.sleep(min(fw.seconds + 1, 60))
        except (ConnectionError, OSError, RPCError) as e:
            print(f"⚠️ หลุดการเชื่อมต่อ: {e} — พยายามเชื่อมใหม่...")
            await asyncio.sleep(3)
        except Exception as e:
            print(f"🔥 Unexpected: {e}")
            traceback.print_exc()
            await asyncio.sleep(3)

# ===== FixLoop Runner (แก้ Task pending) =====
def run_once_with_timeout(round_num: int, timeout_sec: int = 300):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        print(f"🚀 เริ่มรันระบบดักซอง... รอบที่ #{round_num} (จำกัดเวลา {timeout_sec//60} นาทีต่อรอบ)")
        coro = asyncio.wait_for(start_hybrid(), timeout=timeout_sec)
        loop.run_until_complete(coro)
    except asyncio.TimeoutError:
        print(f"⏰ ครบ {timeout_sec//60} นาที — รีสตาร์ตใหม่ (รอบที่ #{round_num})")
    except KeyboardInterrupt:
        print("🛑 ปิดระบบด้วยมือ")
        raise
    except Exception as e:
        print(f"🔥 Error หลัก: {e}")
        traceback.print_exc()
    finally:
        pending = [t for t in asyncio.all_tasks(loop) if not t.done()]
        for t in pending:
            t.cancel()
        if pending:
            try:
                loop.run_until_complete(asyncio.gather(*pending, return_exceptions=True))
            except Exception:
                pass
        try:
            loop.run_until_complete(loop.shutdown_asyncgens())
        except Exception:
            pass
        loop.close()
        print("⏳ รอ 0 วินาทีก่อนเริ่มรอบใหม่...\n")
        time.sleep(0)

if __name__ == "__main__":
    round_num = 1
    while True:
        try:
            run_once_with_timeout(round_num, timeout_sec=300)
        except KeyboardInterrupt:
            break
        round_num += 1
