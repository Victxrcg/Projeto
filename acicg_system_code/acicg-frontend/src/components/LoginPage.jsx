import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import backgroundImg from '../assets/background.png';

const LoginPage = ({ onLoginSuccess }) => {
  const [identificador, setIdentificador] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!identificador.trim()) {
      setError('Por favor, digite sua matrícula ou CPF/CNPJ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(identificador.trim());
      
      if (result.success) {
        onLoginSuccess(result.data);
      } else {
        setError(result.message || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white relative overflow-hidden">
      <motion.img
        src={backgroundImg}
        alt="Fundo ACICG"
        className="absolute inset-0 w-full h-full object-cover opacity-5 pointer-events-none select-none z-0"
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 0.3, scale: 1.09 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
      <div className="relative z-10 w-full flex flex-col items-center justify-center py-16">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-2xl sm:text-4xl font-bold mb-6 text-center text-gray-900"
        >
          Negocie seus débitos com <span className="font-extrabold text-blue-700">descontos de <span className="text-blue-600">até 90%</span></span>
        </motion.h1>
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-xl mx-auto mb-8"
        >
          <input
            id="identificador"
            type="text"
            placeholder="Digite sua Matrícula, CPF/CNPJ ou Nome Completo..."
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            className="flex-3 px-6 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base shadow-sm bg-white"
            disabled={loading}
          />
          <Button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow h-12"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Consultando...
              </>
            ) : (
              'Consultar Grátis'
            )}
          </Button>
        </motion.form>
      </div>
    </div>
  );
};

export default LoginPage;

