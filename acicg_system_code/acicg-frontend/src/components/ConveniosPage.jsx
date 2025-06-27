import React from 'react';
import { motion } from 'framer-motion';

const precos = [
  {
    titulo: 'Notificações por WhatsApp',
    preco: 'R$ 0,55',
    descricao: 'por notificação enviada',
  },
  {
    titulo: 'Notificações por e-mail e SMS',
    preco: 'R$ 0,99',
    descricao: 'pelo pacote de notificações usado a cada transação',
  },
  {
    titulo: 'Notificações presenciais',
    preco: 'R$ 17,00',
    descricao: 'por notificação presencial',
    detalhe: ''
  },
  {
    titulo: 'Negativação SCPC / Boa vista',
    preco: 'Sob consulta',
    descricao: 'por cobrança negativada'
  },
  {
    titulo: 'Retirada Cadastro de Inadimplente Turbo',
    preco: 'R$ 12,00',
    descricao: 'Remoção com prazo reduzido de até 3 horas',
    detalhe: '(Em até 3 horas)'
  },
  {
    titulo: 'Consulta SCPC / Boa vista',
    preco: 'Sob consulta',
    descricao: 'por consulta',
  },
  {
    titulo: 'Conciliação Extrajudicial',
    preco: 'Sob consulta',
    descricao: 'Negociação debitos Extrajudiciais',
  },
  {
    titulo: 'Conciliação Judicial',
    preco: 'Sob consulta',
    descricao: 'Negociação debitos judiciais',
  },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

const card = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

export default function ConveniosPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-2">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Diminua a inadimplência do seu negócio</h1>
      <p className="mb-8 text-center text-gray-600 text-lg">Conheça nossos serviços e preços especiais para clientes conveniados</p>
      <motion.div
        className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {precos.map((item, i) => {
          const isRetiradaTurbo = 
          item.titulo.toLowerCase().includes('retirada') && 
          item.titulo.toLowerCase().includes('turbo');
          let extraClass = '';
          if (precos.length % 3 === 1.5 && i === precos.length - 2) {
            extraClass = 'lg:col-start-2';
          }
          return (
            <motion.div
              key={i}
              className={
                `bg-white rounded-xl shadow p-6 flex flex-col gap-2 hover:shadow-lg transition relative ` +
                (isRetiradaTurbo ? 'border-2 border-blue-500' : 'border border-gray-200') +
                ' ' + extraClass
              }
              variants={card}
              style={isRetiradaTurbo ? {overflow:'visible'} : {}}
            >
              {isRetiradaTurbo && (
                <motion.div
                  initial={{ opacity: 0.5, boxShadow: '0 0 0 0 #3b82f6' }}
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                    boxShadow: [
                      '0 0 0 0 #3b82f6',
                      '0 0 16px 4px #3b82f6',
                      '0 0 0 0 #3b82f6'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-xl pointer-events-none border-2 border-blue-400"
                  style={{ zIndex: 2 }}
                />
              )}
              <div className="text-lg font-semibold text-blue-800 mb-1">
                {item.titulo} {item.detalhe && <span className="text-xs text-gray-500">{item.detalhe}</span>}
              </div>
              <div className="text-2xl font-bold text-blue-700">{item.preco}</div>
              <div className="text-sm text-gray-600">{item.descricao}</div>
            </motion.div>
          );
        })}
      </motion.div>
      <button className="bg-blue-700 text-white px-8 py-3 rounded-full font-semibold text-lg shadow hover:bg-blue-800 transition">Servicos inclusos no portal</button>
    </div>
  );
} 