import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Percent, Calendar, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const OpcaoNegociacaoCard = ({ opcao, onEscolher, loading }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.04, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      className={`relative cursor-pointer transition-all hover:shadow-md`}
      onClick={() => onEscolher(opcao)}
    >
      <Card className="border border-gray-200">
        {opcao.melhor_opcao && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
            <Badge className="bg-green-500 text-white px-3 py-1 text-sm font-semibold shadow-md rounded-b-md">
              MELHOR OPÇÃO
            </Badge>
          </div>
        )}
        
        <CardHeader className="text-center pt-6 pb-0 bg-blue-600 text-white rounded-t-lg relative">
          <CardTitle className="text-lg font-bold">
            {opcao.tipo === 'a_vista' ? 'À VISTA' : 'PARCELADO'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          {/* Percentual de desconto */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Percent className="w-8 h-8 text-blue-600" />
              <span className="text-4xl font-bold text-blue-600">{opcao.percentual_desconto}%</span>
            </div>
            <p className="text-gray-600 font-medium">de desconto</p>
          </div>

          {/* Valor final */}
          <div className="text-center border-t border-b border-gray-200 py-4">
            {opcao.tipo === 'a_vista' ? (
              <div>
                <p className="text-sm text-gray-600 mb-1">À vista de</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(opcao.valor_final)}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Entrada de</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(opcao.valor_entrada)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    +{opcao.numero_parcelas - 1}x de
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(opcao.valor_parcela)}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  Total: {formatCurrency(opcao.valor_final)}
                </div>
              </div>
            )}
          </div>

          {/* Economia */}
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">
              Economia de {formatCurrency(opcao.economia)}
            </span>
          </div>

          {/* Detalhes adicionais */}
          <div className="space-y-2 text-sm text-gray-600">
            {opcao.tipo === 'a_vista' && (
              <p>A multa está inclusa no valor do acordo</p>
            )}
            
            {opcao.tipo === 'parcelado' && (
              <p>Parcelas corrigidas anualmente pela UFIR/RJ</p>
            )}
            
            {opcao.valido_ate && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Condição válida para pagamento até {formatDate(opcao.valido_ate)}</span>
              </div>
            )}
          </div>

          {/* Botão de ação */}
          <Button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
          >
            {loading ? 'Processando...' : 'Escolher'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OpcaoNegociacaoCard;

