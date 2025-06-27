import { Phone, MessageCircle, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import logoACICG from '../assets/logoACICG.jpg';
import { motion } from 'framer-motion';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="w-full bg-white shadow-md z-50 sticky top-0 left-0"
    >
      {/* Top bar */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-2 text-xs sm:text-sm gap-1 sm:gap-2">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4 w-full sm:w-auto justify-center">
              <span className="text-gray-600">Redes Sociais:</span>
              <div className="flex space-x-2">
                <Facebook className="w-4 h-4 text-blue-600 hover:text-blue-800 cursor-pointer" />
                <Instagram className="w-4 h-4 text-pink-600 hover:text-pink-800 cursor-pointer" />
                <Linkedin className="w-4 h-4 text-blue-700 hover:text-blue-900 cursor-pointer" />
                <Twitter className="w-4 h-4 text-blue-400 hover:text-blue-600 cursor-pointer" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-6 w-full sm:w-auto justify-center">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600 hidden xs:inline">Central de atendimento ligação gratuita:</span>
                <span className="font-semibold text-gray-900">0800 123 4060</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-semibold cursor-pointer hover:text-green-800">
                  Chamar no WhatsApp
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center py-3 gap-2 md:gap-0">
          <div className="flex flex-col items-center md:flex-row md:items-center w-full md:w-auto justify-center md:justify-start">
            <button
              onClick={() => { window.location.hash = ''; }}
              className="flex items-center space-x-2 md:space-x-3 bg-transparent border-none cursor-pointer focus:outline-none"
              style={{ padding: 0 }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white overflow-hidden border border-blue-200">
                <img src={logoACICG} alt="Logo ACICG" className="object-contain w-full h-full" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-xl md:text-2xl font-bold text-blue-600">ACICG</h1>
                <p className="text-xs md:text-sm text-gray-600">Simples, Rápido e Seguro</p>
              </div>
            </button>
          </div>
          {/* Hamburger menu for mobile */}
          <div className="md:hidden flex justify-center w-full">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-md border border-gray-200">
              <Menu className="w-6 h-6 text-blue-600" />
            </button>
          </div>
          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Quem Somos</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Dívidas</a>
            <button onClick={() => { setMenuOpen(false); window.location.hash = '#convenios'; }} className="text-gray-700 hover:text-blue-600 font-medium bg-transparent border-none cursor-pointer">Convênios</button>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Fale Conosco</a>
            <button onClick={() => { window.location.hash = ''; }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Acessar Conta
            </button>
          </nav>
        </div>
        {/* Mobile menu dropdown */}
        {menuOpen && (
          <nav className="md:hidden flex flex-col space-y-2 pb-4 animate-fade-in text-center">
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Quem Somos</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Dívidas</a>
            <button onClick={() => { setMenuOpen(false); window.location.hash = '#convenios'; }} className="text-gray-700 hover:text-blue-600 font-medium bg-transparent border-none cursor-pointer">Convênios</button>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Fale Conosco</a>
            <button onClick={() => { setMenuOpen(false); window.location.hash = ''; }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Acessar Conta
            </button>
          </nav>
        )}
      </div>
    </motion.header>
  );
};

export default Header;

