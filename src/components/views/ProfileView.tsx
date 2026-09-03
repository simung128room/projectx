import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Shield, Clock, CreditCard, Bell, Sparkles, Check, Key, LogOut } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const ProfileView: React.FC = () => {
  const { user, sessions, activeRentals, storeOrders, logout, setCurrentView } = useApp();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });

  const totalAFKHours = sessions.reduce((acc, s) => acc + s.durationHours, 0);

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setWebhookSaved(true);
    setTimeout(() => setWebhookSaved(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passForm.newPass || passForm.newPass !== passForm.confirmPass) return;
    setPasswordChangeSuccess(true);
    setPassForm({ oldPass: '', newPass: '', confirmPass: '' });
    setTimeout(() => setPasswordChangeSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      
      {/* Profile Header Card - Borderless */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141517] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-neutral-400" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white font-prompt">
                {user.username}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {user.rank || 'VIP Member'}
              </span>
            </div>
            <div className="text-xs text-neutral-400">
              {user.email} · สมาชิกตั้งแต่ {user.joinedDate || '2026'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <button
            onClick={() => setCurrentView('wallet')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all cursor-pointer shadow-sm text-center"
          >
            เติมเงิน (฿{user.walletBalance.toFixed(2)})
          </button>
          <button
            onClick={logout}
            className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Overview Grid - Borderless */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#141517] shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
            <span>ยอดเงินคงเหลือ</span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatCurrency(user.walletBalance)}
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#141517] shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>ชั่วโมง AFK สะสม</span>
          </div>
          <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white">
            {totalAFKHours} ชม.
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#141517] shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>ไอดีที่กำลังเช่า</span>
          </div>
          <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white">
            {activeRentals.filter(r => r.status === 'active').length} รายการ
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#141517] shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Shield className="w-3.5 h-3.5 text-purple-500" />
            <span>คำสั่งซื้อไอดีทั้งหมด</span>
          </div>
          <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white">
            {storeOrders.length} ออเดอร์
          </div>
        </div>
      </div>

      {/* Settings Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Discord Webhook Integration - Borderless */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141517] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white font-prompt">
              ระบบแจ้งเตือน Discord Webhook
            </h2>
          </div>
          <p className="text-xs text-neutral-400">
            รับการแจ้งเตือนทันทีเมื่อบอทฟาร์มเสร็จ เลเวลอัป ดรอปไอเทมแรร์ หรือเซสชันใกล้หมดเวลา
          </p>

          <form onSubmit={handleSaveWebhook} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Discord Webhook URL
              </label>
              <input
                type="url"
                placeholder="https://discord.com/api/webhooks/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:bg-neutral-200/60 dark:focus:bg-neutral-800 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {webhookSaved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{webhookSaved ? 'บันทึกเรียบร้อย' : 'บันทึก Webhook'}</span>
            </button>
          </form>
        </div>

        {/* Change Password - Borderless */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#141517] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white font-prompt">
              เปลี่ยนรหัสผ่านบัญชี
            </h2>
          </div>
          <p className="text-xs text-neutral-400">
            เพื่อความปลอดภัย แนะนำให้เปลี่ยนรหัสผ่านเป็นประจำ
          </p>

          <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
            <input
              type="password"
              placeholder="รหัสผ่านปัจจุบัน"
              value={passForm.oldPass}
              onChange={(e) => setPassForm(prev => ({ ...prev, oldPass: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:bg-neutral-200/60 dark:focus:bg-neutral-800 transition-all"
            />
            <input
              type="password"
              placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
              value={passForm.newPass}
              onChange={(e) => setPassForm(prev => ({ ...prev, newPass: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:bg-neutral-200/60 dark:focus:bg-neutral-800 transition-all"
            />
            <input
              type="password"
              placeholder="ยืนยันรหัสผ่านใหม่"
              value={passForm.confirmPass}
              onChange={(e) => setPassForm(prev => ({ ...prev, confirmPass: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:bg-neutral-200/60 dark:focus:bg-neutral-800 transition-all"
            />

            <button
              type="submit"
              disabled={!passForm.newPass || passForm.newPass !== passForm.confirmPass}
              className={`w-full py-2.5 rounded-2xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                passForm.newPass && passForm.newPass === passForm.confirmPass
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
              }`}
            >
              {passwordChangeSuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : null}
              <span>{passwordChangeSuccess ? 'เปลี่ยนรหัสผ่านสำเร็จ' : 'ยืนยันการเปลี่ยนรหัสผ่าน'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
