import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import './App.css';

function AppContent() {
  const { user, logout, loading } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);

  const handleLoginSuccess = (userData) => {
    setShowDashboard(true);
  };

  const handleLogout = () => {
    logout();
    setShowDashboard(false);
  };

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

  if (user && showDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <DashboardPage onLogout={handleLogout} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <LoginPage onLoginSuccess={handleLoginSuccess} />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
