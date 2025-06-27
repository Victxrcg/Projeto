import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
      className="w-full bg-blue-700 shadow-inner z-10 text-white"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 text-center md:text-left items-start">
          {/* Central de Atendimento */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Central de Atendimento</h3>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Phone className="w-5 h-5 text-white" />
              <span className="text-white text-sm">0800 123 4060</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Mail className="w-5 h-5 text-white" />
              <span className="text-white text-sm">atendimento@acicg.com.br</span>
            </div>
          </div>
          {/* Endereço */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Nossa Localização</h3>
            <div className="flex items-start justify-center md:justify-start space-x-2">
              <MapPin className="w-5 h-5 text-white mt-1" />
              <div className="text-white text-sm text-left whitespace-nowrap">
                <span>Rua das Empresas, 123 - sala 456</span><br />
                <span>Centro, Campo Grande - MS</span><br />
                <span>CEP 79021-435</span>
              </div>
            </div>
          </div>
          {/* Atendimento Especial */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Atendimento Especial</h3>
            <p className="text-white text-sm mb-1">
              Central de Atendimento à pessoa com deficiência auditiva ou de fala:
            </p>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Phone className="w-5 h-5 text-white" />
              <span className="text-white text-sm">0800 123 4060</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <MessageCircle className="w-5 h-5 text-green-300" />
              <span className="text-green-200 text-sm whitespace-nowrap">Chamar no WhatsApp</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-6 pt-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-bold text-sm">ACICG</span>
              </div>
              <span className="text-white text-xs">© 2025 ACICG - Agência de Crediários. Todos os direitos reservados.</span>
            </div>
            <div className="text-xs text-blue-100">
              <span>+2963 pessoas beneficiadas</span>
              <br />
              <span>Faça parte dos clientes que fizeram a escolha certa: negocie com a ACICG.</span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;

