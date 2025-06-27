import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, CreditCard, FileText, Download, ArrowLeft, CheckCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDividas, useBoletos, getAcordos, criarAcordo, deleteAcordo } from '../hooks/useApi';
import OpcaoNegociacaoCard from './OpcaoNegociacaoCard';
import { AnimatePresence, motion } from 'framer-motion';
import bannerAcicg from '../assets/banner.jpg';
import bannerAcicg2 from '../assets/banner2.jpg';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const DashboardPage = ({ onLogout }) => {
  const { user } = useAuth();
  const { dividas, loading: dividasLoading, error: dividasError, fetchDividas, fetchOpcoes } = useDividas();
  const { loading: boletoLoading, gerarBoleto, downloadBoleto } = useBoletos();
  
  const [opcoes, setOpcoes] = useState([]);
  const [opcoesLoading, setOpcoesLoading] = useState(false);
  const [selectedDivida, setSelectedDivida] = useState(null);
  const [boleto, setBoleto] = useState(null);
  const [step, setStep] = useState('dividas'); // 'dividas', 'opcoes', 'aceite', 'boleto'
  const [selectedOpcao, setSelectedOpcao] = useState(null);
  const [aceiteChecked, setAceiteChecked] = useState(false);
  const [tab, setTab] = useState('oportunidades');
  const [acordos, setAcordos] = useState([]);
  const [acordosLoading, setAcordosLoading] = useState(false);
  const [acordosError, setAcordosError] = useState(null);
  const [expandedAcordoId, setExpandedAcordoId] = useState(null);
  const [bloqueioAcordo, setBloqueioAcordo] = useState(null);

  // Banners para o carrossel
  const banners = [bannerAcicg, bannerAcicg2];
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 10000); // Troca a cada 20 segundos
    return () => clearInterval(interval);
  }, [banners.length]);

  // MOCK: acordos do usuário
  const mockAcordos = [
    {
      id: 1,
      tipo: 'À vista',
      valor_total: 1200.00,
      parcelas: 1,
      valor_parcela: 1200.00,
      datas: ['2024-07-10'],
      status: 'Pago',
      termo_url: '#',
    },
    {
      id: 2,
      tipo: 'Parcelado',
      valor_total: 1800.00,
      parcelas: 3,
      valor_parcela: 600.00,
      datas: ['2024-07-10', '2024-08-10', '2024-09-10'],
      status: 'Em aberto',
      termo_url: '#',
    },
  ];

  useEffect(() => {
    if (user) {
      fetchDividas();
    }
  }, [user]);

  useEffect(() => {
    if (dividas.length > 0 && !selectedDivida) {
      // Automaticamente selecionar a primeira dívida
      handleVerOpcoes(dividas[0]);
    }
  }, [dividas]);

  useEffect(() => {
    if (tab === 'acordos') {
      setAcordosLoading(true);
      setAcordosError(null);
      getAcordos()
        .then(setAcordos)
        .catch(err => setAcordosError(err.message))
        .finally(() => setAcordosLoading(false));
    }
  }, [tab]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleVerOpcoes = async (divida) => {
    setSelectedDivida(divida);
    setOpcoesLoading(true);
    setBloqueioAcordo(null);
    // Verifica se já existe acordo para a matrícula
    const matricula = divida.cliente?.matricula;
    const acordoExistente = acordos.find(a => a.matricula === matricula);
    if (acordoExistente) {
      setBloqueioAcordo('Já existe um acordo ativo para esta matrícula. Para negociar novamente, remova o acordo atual em "Meus Acordos".');
      setOpcoesLoading(false);
      return;
    }
    try {
      const opcoesData = await fetchOpcoes(divida.id);
      setOpcoes(opcoesData);
      setStep('opcoes');
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
    } finally {
      setOpcoesLoading(false);
    }
  };

  const handleEscolherOpcao = (opcao) => {
    setSelectedOpcao(opcao);
    setStep('aceite');
  };

  const handleAceiteProsseguir = async () => {
    if (!selectedOpcao) return;
    try {
      const boletoData = await gerarBoleto(selectedOpcao.id);
      setBoleto(boletoData);
      // Montar termo aceito
      const termoAceito = `Eu, ${user?.nome?.toUpperCase()}, CPF ${user?.cpf}, reconheço que possuo uma dívida para com a ${selectedDivida?.credor} decorrente do contrato consolidado especificado nesta renegociação.\n\nA dívida mencionada será paga por mim à ${selectedDivida?.credor} na importância total de ${formatCurrency(selectedOpcao.valor_final)} na condição ${selectedOpcao.tipo === 'a_vista' ? 'à vista' : 'parcelada'}, sendo ${selectedOpcao.tipo === 'a_vista' ? `o valor de ${formatCurrency(selectedOpcao.valor_final)}` : `a entrada de ${formatCurrency(selectedOpcao.valor_entrada)} mais ${selectedOpcao.numero_parcelas - 1} parcelas de ${formatCurrency(selectedOpcao.valor_parcela)}`}, com vencimentos nos meses seguintes, conforme especificadas em cada etapa onde foram selecionadas e autorizadas a oferta, a entrada, as parcelas e os vencimentos.\n\nO não pagamento no prazo previsto da entrada ou valor à vista, bem como das parcelas em caso de parcelamento, poderá acarretar na incidência de juros e mesmo o cancelamento do acordo.\n\nAs parcelas com vencimento, a partir de janeiro de 2024, serão reajustadas anualmente de acordo com a UFIR/RJ (Unidade Fiscal de Referência), indexador substituto ao extinto BTN. Portanto, em 1º de janeiro de cada ano seguinte, as parcelas serão reajustadas em Reais de acordo com a variação da UFIR/RJ publicada no ano correspondente pela Secretaria da Fazenda do Rio de Janeiro. O histórico do indexador para simples conferência pode ser visto em fazenda.rj.gov.br. E, por estarem justas e combinadas as partes, eu, autorizo por meio do aceite simples nesta etapa sem a necessidade de assinatura.`;
      // Montar array de parcelas
      let parcelas = [];
      if (selectedOpcao.tipo === 'a_vista') {
        parcelas = [{
          valor: Number(selectedOpcao.valor_final),
          data: boletoData.data_vencimento,
          status: 'aberto',
        }];
      } else {
        // Parcelado: entrada + parcelas
        parcelas = [
          {
            valor: Number(selectedOpcao.valor_entrada),
            data: boletoData.data_vencimento,
            status: 'aberto',
          },
        ];
        for (let i = 1; i < selectedOpcao.numero_parcelas; i++) {
          parcelas.push({
            valor: Number(selectedOpcao.valor_parcela),
            data: boletoData.datas_parcelas ? boletoData.datas_parcelas[i - 1] : null,
            status: 'aberto',
          });
        }
      }
      // Salvar acordo
      await criarAcordo({
        divida_id: selectedDivida.id,
        opcao_negociacao_id: selectedOpcao.id,
        termo_aceito: termoAceito,
        parcelas,
        status: 'ativo',
      });
      // Atualizar acordos
      if (tab === 'acordos') {
        setAcordosLoading(true);
        getAcordos().then(setAcordos).finally(() => setAcordosLoading(false));
      }
      setStep('boleto');
    } catch (error) {
      console.error('Erro ao gerar boleto ou salvar acordo:', error);
    }
  };

  const handleDownloadBoleto = async () => {
    if (boleto) {
      try {
        await downloadBoleto(boleto.id);
      } catch (error) {
        console.error('Erro ao baixar boleto:', error);
      }
    }
  };

  const handleVoltar = () => {
    if (step === 'boleto') {
      setStep('opcoes');
      setBoleto(null);
    } else if (step === 'aceite') {
      setStep('opcoes');
      setAceiteChecked(false);
      setSelectedOpcao(null);
    } else if (step === 'opcoes') {
      setStep('dividas');
      setSelectedDivida(null);
      setOpcoes([]);
    }
  };

  const handleDownloadTermo = async (acordoId) => {
    try {
      const res = await fetch(`/api/acordos/${acordoId}/termo`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erro ao baixar termo');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `termo_acordo_${acordoId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Erro ao baixar termo PDF');
    }
  };

  const handleRemoverAcordo = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este acordo?')) return;
    try {
      await deleteAcordo(id);
      setAcordosLoading(true);
      getAcordos().then(setAcordos).finally(() => setAcordosLoading(false));
    } catch (e) {
      alert('Erro ao remover acordo');
    }
  };

  if (dividasLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando suas informações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner institucional animado */}
      <div className="w-full h-56 mb-6 rounded-b-lg shadow overflow-hidden relative" style={{background:'#fff'}}>
        <AnimatePresence mode="wait">
          {banners.length > 0 ? (
            <motion.img
              key={bannerIndex}
              src={banners[bannerIndex]}
              alt="Banner ACICG"
              className="w-full h-56 object-cover object-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
              style={{ borderRadius: '' }}
            />
          ) : (
            <div className="w-full h-56 flex items-center justify-center bg-gray-200 text-gray-500">
              Banner não disponível
            </div>
          )}
        </AnimatePresence>
      </div>
      {/* Header da página */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
              {step !== 'dividas' && (
                <Button 
                  variant="outline" 
                  onClick={handleVoltar}
                  className="flex items-center space-x-2 w-full sm:w-auto justify-center mb-2 sm:mb-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </Button>
              )}
              <div className="flex flex-col items-center sm:items-start w-full">
                <div className="flex items-center space-x-2">
                  <User className="w-6 h-6 text-blue-600" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 text-center sm:text-left break-words">
                    Olá, {user?.nome}!
                  </h2>
                </div>
                <p className="text-xs text-gray-600 text-center sm:text-left">Acessar Minha Conta</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout} className="text-xs sm:text-base px-2 sm:px-4 py-1 sm:py-2">
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="oportunidades" className={tab === 'oportunidades' ? 'text-blue-600' : ''}>
              <FileText className="w-5 h-5" /> Minhas Oportunidades
            </TabsTrigger>
            <TabsTrigger value="acordos" className={tab === 'acordos' ? 'text-blue-600' : ''}>
              <CreditCard className="w-5 h-5" /> Meus Acordos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="oportunidades">
            {/* Alerta de acordo ativo */}
            {(() => {
              // Verifica se há acordo ativo para a matrícula do usuário
              const matricula = user?.matricula || user?.matricula_id || (dividas && dividas[0]?.cliente?.matricula);
              const acordoAtivo = acordos.find(a => a.matricula === matricula);
              if (acordoAtivo) {
                return (
                  <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded shadow text-center font-medium mb-6">
                    Você já possui um acordo ativo para a matrícula <b>{matricula}</b>.<br />
                    Para negociar novamente, remova o acordo atual na aba <b>Meus Acordos</b>.
                  </div>
                );
              }
              return null;
            })()}
            {/* Título da seção */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {step === 'dividas' && 'Minhas Oportunidades'}
                {step === 'opcoes' && 'Pague todos seus débitos com as melhores condições'}
                {step === 'aceite' && 'Aceite os Termos'}
                {step === 'boleto' && 'Boleto Gerado com Sucesso!'}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {step === 'dividas' && `Olá, ${user?.nome}! Confira as oportunidades que preparamos para você`}
                {step === 'opcoes' && 'Escolha a melhor opção de pagamento para sua situação'}
                {step === 'aceite' && 'Leia e aceite os termos para concluir sua negociação'}
                {step === 'boleto' && 'Seu boleto foi gerado e está pronto para download'}
              </p>
            </div>

            {dividasError && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{dividasError}</AlertDescription>
              </Alert>
            )}

            {/* Conteúdo baseado no step */}
            <AnimatePresence mode="wait">
              {step === 'dividas' && (
                <motion.div
                  key="dividas"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.12 } },
                    exit: {},
                  }}
                  className="space-y-4 sm:space-y-6"
                >
                  {dividas.map((divida) => (
                    <motion.div
                      key={divida.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                      <Card key={divida.id} className="shadow-lg border border-gray-200">
                        <CardContent className="p-4 sm:p-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div>
                              <p className="text-sm text-gray-600">CREDOR:</p>
                              <p className="font-semibold text-gray-900">{divida.credor}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">MATRÍCULA:</p>
                              <p className="font-semibold text-gray-900">{divida.cliente?.matricula}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">VALOR DA DÍVIDA:</p>
                              <p className="font-semibold text-gray-900">{formatCurrency(divida.valor_atual)}</p>
                            </div>
                            <div className="text-right">
                              <Button 
                                onClick={() => handleVerOpcoes(divida)}
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={opcoesLoading}
                              >
                                {opcoesLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Carregando...
                                  </>
                                ) : (
                                  'Ver Oportunidades'
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {step === 'opcoes' && selectedDivida && (
                <motion.div
                  key="opcoes"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="space-y-6"
                >
                  {/* Informações da dívida */}
                  <Card className="bg-blue-50 border-blue-200 border border-gray-200">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">CREDOR:</p>
                          <p className="font-semibold">{selectedDivida.credor}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">MATRÍCULA:</p>
                          <p className="font-semibold">{selectedDivida.cliente?.matricula}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">VALOR DA DÍVIDA:</p>
                          <p className="font-semibold">{formatCurrency(selectedDivida.valor_atual)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">FATURAS:</p>
                          <p className="font-semibold">{selectedDivida.numero_faturas}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Bloqueio de negociação se já houver acordo */}
                  {bloqueioAcordo ? (
                    <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded shadow text-center font-medium">
                      {bloqueioAcordo}
                    </div>
                  ) : opcoesLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-600">Carregando opções de negociação...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {opcoes.map((opcao) => (
                        <OpcaoNegociacaoCard
                          key={opcao.id}
                          opcao={opcao}
                          onEscolher={handleEscolherOpcao}
                          loading={boletoLoading}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
              {step === 'aceite' && selectedOpcao && (
                <motion.div
                  key="aceite"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="flex flex-col items-center justify-center"
                >
                  <Card className="w-full max-w-4xl mx-auto flex flex-col md:flex-row p-0 overflow-hidden border border-gray-200">
                    {/* Resumo da opção escolhida */}
                    <div className="bg-blue-50 p-6 md:w-1/4 flex flex-col items-center justify-center">
                      <div className="w-full text-center">
                        <div className="bg-blue-700 text-white rounded-t-md py-2 font-bold text-lg mb-4">VOCÊ ESCOLHEU</div>
                        <div className="text-5xl font-extrabold text-blue-900 mb-2">{selectedOpcao.percentual_desconto}%</div>
                        <div className="text-xl font-semibold text-blue-900 mb-4">de desconto</div>
                        <div className="bg-white rounded-lg shadow p-4 mb-2">
                          {selectedOpcao.tipo === 'a_vista' ? (
                            <>
                              <div className="text-gray-700 text-sm mb-1">À vista de</div>
                              <div className="text-2xl font-bold text-green-600 mb-1">{formatCurrency(selectedOpcao.valor_final)}</div>
                            </>
                          ) : (
                            <>
                              <div className="text-gray-700 text-sm mb-1">Entrada de</div>
                              <div className="text-xl font-bold text-blue-600">{formatCurrency(selectedOpcao.valor_entrada)}</div>
                              <div className="text-gray-700 text-sm mt-2">+{selectedOpcao.numero_parcelas - 1}x de</div>
                              <div className="text-xl font-bold text-blue-600">{formatCurrency(selectedOpcao.valor_parcela)}</div>
                              <div className="text-xs text-gray-500 mt-2">Total: {formatCurrency(selectedOpcao.valor_final)}</div>
                            </>
                          )}
                        </div>
                        {selectedOpcao.valido_ate && (
                          <div className="text-xs text-gray-500 mt-2">Condição válida para pagamento parcelado até {new Date(selectedOpcao.valido_ate).toLocaleDateString('pt-BR')}</div>
                        )}
                      </div>
                    </div>
                    {/* Termos do acordo */}
                    <div className="flex-1 p-8 flex flex-col justify-between bg-white shadow-inner">
                      <div>
                        <h2 className="text-2xl font-bold text-center mb-2">Aceite dos Termos</h2>
                        <h3 className="text-lg font-semibold text-center mb-4 text-blue-900">Leia e aceite os termos para concluir sua negociação</h3>
                        <div className="rounded-lg mb-4 max-h-[45rem] overflow-y-auto text-base text-gray-800 leading-relaxed bg-white p-6 shadow border border-gray-200" style={{ whiteSpace: 'pre-line' }}>
                          Eu, {user?.nome?.toUpperCase()}, CPF {user?.cpf}, reconheço que possuo uma dívida para com a {selectedDivida?.credor} decorrente do contrato consolidado especificado nesta renegociação.\n\nA dívida mencionada será paga por mim à {selectedDivida?.credor} na importância total de {formatCurrency(selectedOpcao.valor_final)} na condição {selectedOpcao.tipo === 'a_vista' ? 'à vista' : 'parcelada'}, sendo {selectedOpcao.tipo === 'a_vista' ? `o valor de ${formatCurrency(selectedOpcao.valor_final)}` : `a entrada de ${formatCurrency(selectedOpcao.valor_entrada)} mais ${selectedOpcao.numero_parcelas - 1} parcelas de ${formatCurrency(selectedOpcao.valor_parcela)}`}, com vencimentos nos meses seguintes, conforme especificadas em cada etapa onde foram selecionadas e autorizadas a oferta, a entrada, as parcelas e os vencimentos.\n\nO não pagamento no prazo previsto da entrada ou valor à vista, bem como das parcelas em caso de parcelamento, poderá acarretar na incidência de juros e mesmo o cancelamento do acordo.\n\nAs parcelas com vencimento, a partir de janeiro de 2024, serão reajustadas anualmente de acordo com a UFIR/RJ (Unidade Fiscal de Referência), indexador substituto ao extinto BTN. Portanto, em 1º de janeiro de cada ano seguinte, as parcelas serão reajustadas em Reais de acordo com a variação da UFIR/RJ publicada no ano correspondente pela Secretaria da Fazenda do Rio de Janeiro. O histórico do indexador para simples conferência pode ser visto em fazenda.rj.gov.br. E, por estarem justas e combinadas as partes, eu, autorizo por meio do aceite simples nesta etapa sem a necessidade de assinatura.
                        </div>
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            id="aceite-termos"
                            checked={aceiteChecked}
                            onChange={e => setAceiteChecked(e.target.checked)}
                            className="mr-2 w-5 h-5 accent-blue-600"
                          />
                          <label htmlFor="aceite-termos" className="text-base font-medium text-gray-800 select-none">
                            Aceito os termos da negociação
                          </label>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 justify-end">
                        <Button variant="outline" onClick={() => setStep('opcoes')}>
                          Voltar
                        </Button>
                        <Button
                          onClick={handleAceiteProsseguir}
                          disabled={!aceiteChecked}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Prosseguir
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
              {step === 'boleto' && boleto && (
                <motion.div
                  key="boleto"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="max-w-2xl mx-auto"
                >
                  <Card className="shadow-lg border border-gray-200">
                    <CardHeader className="text-center bg-green-50">
                      <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl text-green-700">
                        Boleto Gerado com Sucesso!
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-6">
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valor:</span>
                          <span className="font-semibold">{formatCurrency(boleto.valor)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vencimento:</span>
                          <span className="font-semibold">
                            {new Date(boleto.data_vencimento).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 sm:gap-0">
                          <span className="text-gray-600">Código de Barras:</span>
                          <span className="font-mono text-sm break-all max-w-full overflow-x-auto whitespace-pre-wrap">{boleto.codigo_barras}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Button 
                          onClick={handleDownloadBoleto}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Baixar Boleto PDF
                        </Button>

                        <div className="text-sm text-gray-600 space-y-2">
                          <p><strong>Instruções:</strong></p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Pague este boleto em qualquer banco, lotérica ou internet banking</li>
                            <li>Após o vencimento, sujeito a multa e juros</li>
                            <li>Em caso de dúvidas, entre em contato conosco</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
          <TabsContent value="acordos">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Meus Acordos</h1>
              <p className="text-gray-600 text-sm sm:text-base">Acompanhe aqui todos os acordos realizados, clique para ver detalhes das parcelas.</p>
            </div>
            <div className="space-y-4 max-w-3xl mx-auto">
              {acordosLoading ? (
                <div className="text-center py-8 text-blue-600">Carregando acordos...</div>
              ) : acordosError ? (
                <div className="text-center py-8 text-red-600">{acordosError}</div>
              ) : acordos.length === 0 ? (
                <div className="text-center text-gray-500">Nenhum acordo encontrado.</div>
              ) : (
                acordos.map(acordo => {
                  const expanded = expandedAcordoId === acordo.id;
                  const tipo = acordo.parcelas && acordo.parcelas.length > 1 ? 'Parcelado' : 'À vista';
                  const valorNegociado = acordo.parcelas && acordo.parcelas.length > 0 ? acordo.parcelas.reduce((acc, p) => acc + (p.valor || 0), 0) : '-';
                  const parcelasQtd = acordo.parcelas ? acordo.parcelas.length : '-';
                  const statusColor = acordo.status === 'Pago' ? 'text-green-600' : acordo.status === 'Cancelado' ? 'text-red-600' : 'text-yellow-600';
                  return (
                    <div key={acordo.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden transition-all">
                      {/* Card horizontal resumo */}
                      <button
                        className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 hover:bg-blue-50 focus:outline-none transition-colors"
                        onClick={() => setExpandedAcordoId(expanded ? null : acordo.id)}
                        aria-expanded={expanded}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <Badge className={tipo === 'Parcelado' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}>{tipo}</Badge>
                          <span className="text-lg font-bold text-blue-800 truncate">{typeof valorNegociado === 'number' ? valorNegociado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : valorNegociado}</span>
                          <span className={statusColor + ' font-semibold'}>{acordo.status}</span>
                          <span className="text-xs text-gray-400">{acordo.data_aceite ? new Date(acordo.data_aceite).toLocaleDateString('pt-BR') : '-'}</span>
                          <span className="text-xs text-gray-500">{acordo.divida_id ? `Credor: ${acordo.divida_id}` : ''}</span>
                          <span className="text-xs text-gray-500">Parcelas: {parcelasQtd}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="flex items-center gap-1 text-blue-800" onClick={e => { e.stopPropagation(); handleDownloadTermo(acordo.id); }}>
                            <Download className="w-4 h-4" /> Termo
                          </Button>
                          <Button size="sm" variant="destructive" className="flex items-center gap-1" onClick={e => { e.stopPropagation(); handleRemoverAcordo(acordo.id); }}>
                            <Trash2 className="w-4 h-4" /> Remover
                          </Button>
                          <span className="text-xs text-blue-600 font-semibold">{expanded ? 'Fechar' : 'Detalhar'}</span>
                        </div>
                      </button>
                      {/* Detalhes expansíveis */}
                      {expanded && (
                        <div className="bg-gray-50 border-t px-6 py-4 animate-fade-in">
                          {tipo === 'À vista' ? (
                            <div className="flex flex-col items-start gap-2">
                              <div className="text-base font-semibold text-blue-800 mb-2">Pagamento à vista</div>
                              {acordo.parcelas && acordo.parcelas[0] && (
                                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white border border-blue-200 rounded-lg shadow p-4">
                                  <span className="font-semibold">Parcela única</span>
                                  <span>Vencimento: {acordo.parcelas[0].data ? new Date(acordo.parcelas[0].data).toLocaleDateString('pt-BR') : '-'}</span>
                                  <span className="text-lg font-bold text-blue-700">{typeof acordo.parcelas[0].valor === 'number' ? acordo.parcelas[0].valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</span>
                                  <span className={acordo.parcelas[0].status === 'Pago' ? 'text-green-600' : 'text-yellow-600'}>{acordo.parcelas[0].status}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <div className="text-base font-semibold text-blue-800 mb-2">Parcelamento</div>
                              <div className="flex flex-wrap gap-4">
                                {acordo.parcelas && acordo.parcelas.map((p, i) => (
                                  <div key={i} className="flex flex-col items-center bg-white border border-blue-200 rounded-lg shadow p-4 min-w-[160px]">
                                    <span className="font-semibold mb-1">Parcela {i + 1}/{parcelasQtd}</span>
                                    <span>Vencimento: {p.data ? new Date(p.data).toLocaleDateString('pt-BR') : '-'}</span>
                                    <span className="text-lg font-bold text-blue-700">{typeof p.valor === 'number' ? p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}</span>
                                    <span className={p.status === 'Pago' ? 'text-green-600' : 'text-yellow-600'}>{p.status}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;

