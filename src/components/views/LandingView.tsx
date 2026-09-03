import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, ShieldCheck, Zap, Activity, Gamepad2, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

export const LandingView: React.FC = () => {
  const { setCurrentView, setOpenCreateModal, isLoggedIn, setAuthModalMode, t } = useApp();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-16">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center space-y-6"
      >
        
        {/* Soft Minimal Badge & Logo - Borderless */}
        <div className="flex flex-col items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white dark:bg-[#141517] p-2.5 shadow-sm flex items-center justify-center overflow-hidden"
          >
            <img 
              src="https://img2.pic.in.th/1000047587.png" 
              alt="MINICLOUD Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-[#141517] shadow-xs text-neutral-600 dark:text-neutral-300"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t.badgeSystemOnline}</span>
          </motion.div>
        </div>

        {/* Brand Main Title */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-950 dark:text-white font-prompt">
          MINICLOUD
        </h1>

        {/* Hero Slogan */}
        <p className="text-xl sm:text-2xl font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight font-prompt">
          {t.heroHeadlineAccent}
        </p>

        {/* Description */}
        <p className="max-w-xl mx-auto text-sm sm:text-base text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
          {t.heroDescription}
        </p>

        {/* Hero CTAs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
        >
          <button
            id="landing-get-started-btn"
            onClick={() => {
              if (isLoggedIn) {
                setCurrentView('dashboard');
                setOpenCreateModal(true);
              } else {
                setAuthModalMode('register');
                setCurrentView('auth');
              }
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>{isLoggedIn ? t.btnStartAFKNow : 'เริ่มต้นใช้งาน / เข้าสู่ระบบ'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCurrentView('marketplace')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-white hover:bg-neutral-100 dark:bg-[#141517] dark:hover:bg-neutral-800 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
            <span>ตลาดซื้อ-เช่าไอดี</span>
          </button>
          
          <button
            id="landing-explore-games-btn"
            onClick={() => setCurrentView('games')}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>{t.btnExploreGames}</span>
          </button>
        </motion.div>
      </motion.div>

      {/* 3 Core Highlights (Soft Minimal Cards - Borderless) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { icon: Zap, title: t.featureTitle1, desc: t.featureDesc1 },
          { icon: ShieldCheck, title: t.featureTitle2, desc: t.featureDesc2 },
          { icon: Activity, title: t.featureTitle3, desc: t.featureDesc3 }
        ].map((feature, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + idx * 0.1, duration: 0.4 }}
            className="p-6 rounded-3xl bg-white dark:bg-[#141517] space-y-2.5 shadow-sm"
          >
            <div className="w-9 h-9 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center">
              <feature.icon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white pt-1 font-prompt">
              {feature.title}
            </h3>
            <p className="text-xs text-neutral-400 dark:text-neutral-400 leading-relaxed font-normal">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>

    </div>
  );
};
