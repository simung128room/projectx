import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingView } from './components/views/LandingView';
import { DashboardView } from './components/views/DashboardView';
import { SupportedGamesView } from './components/views/SupportedGamesView';
import { MarketplaceView } from './components/views/MarketplaceView';
import { ActiveRentalsView } from './components/views/ActiveRentalsView';
import { RedeemView } from './components/views/RedeemView';
import { ProfileView } from './components/views/ProfileView';
import { WalletView } from './components/views/WalletView';
import { HistoryView } from './components/views/HistoryView';
import { SessionDetailView } from './components/views/SessionDetailView';
import { AuthView } from './components/views/AuthView';
import { CreateAFKModal } from './components/modals/CreateAFKModal';
import { TopUpModal } from './components/modals/TopUpModal';
import { PurchaseModal } from './components/modals/PurchaseModal';

function MainApp() {
  const { currentView, theme } = useApp();

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#09090b] text-neutral-100' : 'bg-[#fafafa] text-neutral-900'
    }`}>
      {/* Navbar Header */}
      <Navbar />

      {/* Main Dynamic View with AnimatePresence */}
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <LandingView />
            </motion.div>
          )}

          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <DashboardView />
            </motion.div>
          )}

          {currentView === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <MarketplaceView />
            </motion.div>
          )}

          {currentView === 'rentals' && (
            <motion.div
              key="rentals"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <ActiveRentalsView />
            </motion.div>
          )}

          {currentView === 'redeem' && (
            <motion.div
              key="redeem"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <RedeemView />
            </motion.div>
          )}

          {currentView === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <ProfileView />
            </motion.div>
          )}

          {currentView === 'games' && (
            <motion.div
              key="games"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <SupportedGamesView />
            </motion.div>
          )}

          {currentView === 'wallet' && (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <WalletView />
            </motion.div>
          )}

          {currentView === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <HistoryView />
            </motion.div>
          )}

          {currentView === 'session-detail' && (
            <motion.div
              key="session-detail"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <SessionDetailView />
            </motion.div>
          )}

          {currentView === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <AuthView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Modals */}
      <CreateAFKModal />
      <TopUpModal />
      <PurchaseModal />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
