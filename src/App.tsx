import React, { useState, useEffect } from 'react';
import { AuthService } from './core/services/AuthService';
import { NetworkMonitor } from './core/services/NetworkMonitor';
import { UserAuth } from './types/model';
import { Header } from './components/Header';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { BackgroundFetchLab } from './components/BackgroundFetchLab';
import { motion, AnimatePresence } from 'framer-motion';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const [showLabModal, setShowLabModal] = useState<boolean>(false);

  const authService = AuthService.getInstance();
  const networkMonitor = NetworkMonitor.getInstance();

  useEffect(() => {
    // Subscribe to Firebase Auth state
    const unsubscribeAuth = authService.subscribe((currentUser) => {
      setUser(currentUser);
    });

    // Subscribe to Network status
    const unsubscribeNetwork = networkMonitor.subscribe((onlineState) => {
      setIsOnline(onlineState);
      setIsManualOverride(networkMonitor.isManualOfflineOverride());
    });

    return () => {
      unsubscribeAuth();
      unsubscribeNetwork();
    };
  }, []);

  const handleToggleOffline = () => {
    networkMonitor.toggleManualOfflineOverride();
  };

  const handleSignOut = () => {
    authService.signOut();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--spectrum-bg)' }}>
      {/* Show Auth Screen if no user logged in */}
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <AuthView onAuthSuccess={() => {}} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Header
              user={user}
              isOnline={isOnline}
              isManualOverride={isManualOverride}
              onToggleOffline={handleToggleOffline}
              onSignOut={handleSignOut}
              onOpenLab={() => setShowLabModal(true)}
            />

            <DashboardView isOnline={isOnline} />

            {/* Task 2.9 Lab Modal */}
            {showLabModal && (
              <BackgroundFetchLab onClose={() => setShowLabModal(false)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
