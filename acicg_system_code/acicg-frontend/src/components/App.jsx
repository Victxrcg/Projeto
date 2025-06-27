import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import Footer from './Footer';
import { AnimatePresence, motion } from 'framer-motion';
import ConveniosPage from './ConveniosPage';

function AppContent() {
  const { user, logout, loading } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);
  const [route, setRoute] = useState(window.location.hash);

  console.log('ROUTE:', route);

  React.useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleLoginSuccess = (userData) => {
    setShowDashboard(true);
  };

  const handleLogout = () => {
    logout();
    setShowDashboard(false);
  };

  if (route && route.startsWith('#convenios')) {
    console.log('Renderizando página de convênios');
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div></div>
        <Header />
        <ConveniosPage />
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {user && showDashboard ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="flex-1 flex flex-col"
            >
              <DashboardPage onLogout={handleLogout} />
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="flex-1 flex flex-col"
            >
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}

export default AppContent; 