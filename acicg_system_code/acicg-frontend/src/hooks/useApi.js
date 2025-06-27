import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useDividas = () => {
  const [dividas, setDividas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { API_BASE_URL } = useAuth();

  // MOCK: Dados fake para apresentação
  const MOCK_DIVIDAS = [
    {
      id: 1,
      credor: "ACICG",
      valor_original: 36621.31,
      valor_atual: 36621.31,
      numero_faturas: 7,
      data_vencimento: "2025-07-25",
      status: "pendente",
      cliente: {
        matricula: "01167109",
        nome: "ORLANDO LUIZ CARDOSO MORAES"
      }
    }
  ];

  const MOCK_OPCOES = [
    {
      tipo: "a_vista",
      percentual_desconto: 78,
      valor_final: 7960.82,
      economia: 28660.49,
      melhor_opcao: true,
      numero_parcelas: 1
    },
    {
      tipo: "parcelado",
      percentual_desconto: 75,
      valor_final: 9204.70,
      valor_entrada: 1534.12,
      numero_parcelas: 5,
      valor_parcela: 1534.12,
      economia: 27416.61,
      melhor_opcao: false
    },
    {
      tipo: "parcelado",
      percentual_desconto: 59,
      valor_final: 14926.61,
      valor_entrada: 1243.88,
      numero_parcelas: 11,
      valor_parcela: 1243.88,
      economia: 21694.70,
      melhor_opcao: false
    },
    {
      tipo: "parcelado",
      percentual_desconto: 52,
      valor_final: 17414.38,
      valor_entrada: 725.60,
      numero_parcelas: 23,
      valor_parcela: 725.60,
      economia: 19206.93,
      melhor_opcao: false
    }
  ];

  const fetchDividas = async () => {
    setLoading(true);
    setError(null);
    // Simula delay de requisição
    setTimeout(() => {
      setDividas(MOCK_DIVIDAS);
      setLoading(false);
    }, 500);
  };

  const fetchOpcoes = async (dividaId) => {
    // Simula delay de requisição
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_OPCOES);
      }, 300);
    });
  };

  return {
    dividas,
    loading,
    error,
    fetchDividas,
    fetchOpcoes
  };
};

export const useBoletos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const gerarBoleto = async (opcaoId) => {
    setLoading(true);
    setError(null);
    // MOCK: Simula geração de boleto
    return new Promise((resolve) => {
      setTimeout(() => {
        setLoading(false);
        resolve({ id: 1, url: "/mock-boleto.pdf" });
      }, 500);
    });
  };

  const downloadBoleto = async (boletoId) => {
    // MOCK: Simula download de boleto
    alert("Download simulado do boleto " + boletoId);
  };

  return {
    loading,
    error,
    gerarBoleto,
    downloadBoleto
  };
};

export async function getAcordos() {
  // MOCK: Retorna acordos fake
  return [
    {
      id: 1,
      tipo: "a_vista",
      valor: 7960.82,
      data: "2025-06-25",
      parcelas: 1,
      status: "ativo"
    }
  ];
}

export async function criarAcordo(acordo) {
  // MOCK: Simula criação de acordo
  return { success: true, data: acordo };
}

export async function deleteAcordo(id) {
  // MOCK: Simula remoção de acordo
  return { success: true };
}

